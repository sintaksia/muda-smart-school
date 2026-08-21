/**
 * One-off backfill: give every currently placed student a StudentClassHistory
 * row for the academic year their class belongs to.
 *
 * Without this, the first promotion has no "year before" row to restore from,
 * so it could not be undone. Safe to run more than once — existing rows are
 * skipped by the (student, academic year) unique index.
 *
 * Run: bun --env-file=.env scripts/backfill-class-history.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main(): Promise<void> {
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
}

main()
  .catch((error: unknown) => {
    console.error("Backfill gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
