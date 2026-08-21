/**
 * One-off backfill: give every currently placed student a StudentClassHistory
 * row for the academic year their class belongs to.
 *
 * Without this, the first promotion has no "year before" row to restore from,
 * so it could not be undone. Safe to run more than once — existing rows are
 * skipped by the (student, academic year) unique index.
 *
 * Run against dev:  pnpm db:backfill-class-history
 * Run against prod: ENV_FILE=.env.prod pnpm db:backfill-class-history
 *
 * Runs under tsx, not Bun: Bun resolves `pg` with browser conditions and dies
 * on its `tls`/`dns` requires. prisma/seed.ts takes the same route. `pg` is
 * imported dynamically below so the Bun check can report that itself instead of
 * the module loader failing first with an opaque bundler error.
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { ConnectionOptions } from "tls";

if (typeof (globalThis as { Bun?: unknown }).Bun !== "undefined") {
  console.error(
    [
      "Skrip ini tidak bisa dijalankan dengan Bun — `pg` butuh modul Node (tls, dns).",
      "",
      "  Dev  : pnpm db:backfill-class-history",
      "  Prod : ENV_FILE=.env.prod pnpm db:backfill-class-history",
    ].join("\n"),
  );
  process.exit(1);
}

// Load env before anything reads DATABASE_URL.
config({ path: resolve(process.cwd(), process.env.ENV_FILE ?? ".env") });

function isLocalHost(url: string): boolean {
  const host = url.match(/@([^:/?]+)/)?.[1] ?? "";
  if (host === "localhost" || host === "127.0.0.1") {
    return true;
  }
  return /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/.test(
    host,
  );
}

/**
 * TLS settings for a raw pg Pool. Prisma's engine negotiates this on its own,
 * but the adapter's pool does not: left alone it connects in the clear and a
 * managed host drops it.
 *
 * Supabase's pooler presents a chain rooted in their own CA, which Node will
 * not trust. Prisma's default (sslmode=prefer) encrypts without verifying, so
 * that is what the app already does everywhere else and what this matches.
 * Point PGSSLROOTCERT at Supabase's CA file to verify the chain properly.
 */
function sslOption(url: string): ConnectionOptions | undefined {
  if (/[?&]sslmode=/.test(url)) {
    return undefined; // The URL states what it wants; let pg parse it.
  }
  if (isLocalHost(url)) {
    return undefined;
  }
  const caPath = process.env.PGSSLROOTCERT;
  return caPath
    ? { ca: readFileSync(caPath, "utf8") }
    : { rejectUnauthorized: false };
}

async function main(): Promise<void> {
  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const pgRuntime = (await import("pg")).default;

  const connectionString = process.env.DATABASE_URL ?? "";
  if (!connectionString) {
    throw new Error(
      `DATABASE_URL kosong — periksa ${process.env.ENV_FILE ?? ".env"}`,
    );
  }

  const ssl = sslOption(connectionString);
  const pool = new pgRuntime.Pool({
    connectionString,
    ...(ssl ? { ssl } : {}),
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // Say which database is being written to — running this against the wrong
  // one is the mistake worth making loud.
  console.log(`Target: ${connectionString.replace(/\/\/[^@]*@/, "//<hidden>@")}`);

  try {
    const students = await prisma.student.findMany({
      where: { classId: { not: null } },
      select: {
        id: true,
        classId: true,
        status: true,
        schoolClass: { select: { academicYear: true } },
      },
    });

    const rows = students.flatMap((student) =>
      student.schoolClass
        ? [
            {
              studentId: student.id,
              classId: student.classId,
              academicYear: student.schoolClass.academicYear,
              status: student.status,
            },
          ]
        : [],
    );

    if (rows.length === 0) {
      console.log("Tidak ada siswa berkelas — tidak ada yang di-backfill.");
      return;
    }

    const { count } = await prisma.studentClassHistory.createMany({
      data: rows,
      skipDuplicates: true,
    });

    console.log(
      `Backfill selesai: ${count} baris dibuat, ${rows.length - count} sudah ada.`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("Backfill gagal:", error);
  process.exitCode = 1;
});
