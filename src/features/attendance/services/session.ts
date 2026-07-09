import { prisma } from "@/src/lib/prisma";
import type { Sesi } from "@prisma/client";
import { getAttendanceSettings } from "./settings";
import { processSessionDeductions } from "./deduction";
import { notifyUsers, getWaliKelasUserId } from "./notifications";
import { generateQrToken } from "../utils/qr";
import { dateOnlyUtc, toWibParts, wibInstant } from "../utils/time";

export interface OpenSessionResult {
  sesi: Sesi | null;
  error: string | null;
}

/**
 * Process 1 — open a class session for today. Handles the teacher-absence
 * edge case: with an unresolved absence and no substitute the session is
 * recorded as KELAS_KOSONG (no QR, no student penalty).
 */
export async function openSession(
  jadwalId: string,
  options: { byGuruId?: string; now?: Date } = {},
): Promise<OpenSessionResult> {
  const now = options.now ?? new Date();
  const { dateISO, hari } = toWibParts(now);
  const tanggal = dateOnlyUtc(dateISO);

  const jadwal = await prisma.jadwal.findUnique({
    where: { id: jadwalId },
    include: {
      kelas: { include: { students: { where: { status: "AKTIF" } } } },
    },
  });
  if (!jadwal || !jadwal.isActive) {
    return { sesi: null, error: "Jadwal tidak ditemukan" };
  }
  if (jadwal.hari !== hari) {
    return { sesi: null, error: "Jadwal bukan untuk hari ini" };
  }

  const existing = await prisma.sesi.findUnique({
    where: { jadwalId_tanggal: { jadwalId, tanggal } },
  });
  if (existing) {
    if (existing.status === "OPEN") {
      return { sesi: existing, error: null };
    }
    return { sesi: existing, error: "Sesi sudah ditutup" };
  }

  // Teacher absence check (Process 1 edge case / Process 4 step 4).
  const teacherAbsence = await prisma.absensiGuru.findUnique({
    where: {
      jadwalId_guruId_tanggal: { jadwalId, guruId: jadwal.guruId, tanggal },
    },
  });
  const isAbsent = teacherAbsence !== null && teacherAbsence.status !== "HADIR";

  if (isAbsent && !teacherAbsence.substituteGuruId) {
    const sesi = await prisma.sesi.create({
      data: { jadwalId, tanggal, status: "KELAS_KOSONG" },
    });
    const studentUserIds = jadwal.kelas.students.map(
      (student) => student.userId,
    );
    const waliUserId = await getWaliKelasUserId(jadwal.kelasId);
    await notifyUsers(
      [...studentUserIds, ...(waliUserId ? [waliUserId] : [])],
      {
        title: "Kelas kosong",
        body: `Guru berhalangan hadir dan belum ada pengganti. Sesi ${dateISO} ditandai kelas kosong.`,
        type: "KELAS_KOSONG",
        refId: sesi.id,
      },
    );
    return { sesi, error: null };
  }

  const actualGuruId =
    isAbsent && teacherAbsence.substituteGuruId
      ? teacherAbsence.substituteGuruId
      : (options.byGuruId ?? jadwal.guruId);

  const sesi = await prisma.sesi.create({
    data: {
      jadwalId,
      tanggal,
      status: "OPEN",
      openedAt: now,
      qrToken: generateQrToken(),
      qrTokenIssuedAt: now,
      actualGuruId,
    },
  });
  return { sesi, error: null };
}

/** Rotate the QR token (DYNAMIC mode, Process 1 step 3). */
export async function refreshQrToken(sesiId: string): Promise<Sesi | null> {
  const sesi = await prisma.sesi.findUnique({ where: { id: sesiId } });
  if (!sesi || sesi.status !== "OPEN") {
    return null;
  }
  return prisma.sesi.update({
    where: { id: sesiId },
    data: { qrToken: generateQrToken(), qrTokenIssuedAt: new Date() },
  });
}

/**
 * Process 1 step 6 — close a session and trigger Process 3 deductions.
 */
export async function closeSession(
  sesiId: string,
  options: { now?: Date } = {},
): Promise<{ sesi: Sesi | null; error: string | null }> {
  const existing = await prisma.sesi.findUnique({ where: { id: sesiId } });
  if (!existing) {
    return { sesi: null, error: "Sesi tidak ditemukan" };
  }
  if (existing.status !== "OPEN") {
    return { sesi: existing, error: "Sesi sudah ditutup" };
  }
  const sesi = await prisma.sesi.update({
    where: { id: sesiId },
    data: { status: "CLOSED", closedAt: options.now ?? new Date() },
  });
  await processSessionDeductions(sesiId);
  return { sesi, error: null };
}

/**
 * Background job — auto-close every OPEN session past
 * scheduled_end + SESSION_GRACE_PERIOD_MINUTES.
 */
export async function autoCloseDueSessions(
  now: Date = new Date(),
): Promise<number> {
  const settings = await getAttendanceSettings();
  const openSessions = await prisma.sesi.findMany({
    where: { status: "OPEN" },
    include: { jadwal: { select: { jamSelesai: true } } },
  });

  let closed = 0;
  for (const sesi of openSessions) {
    const dateISO = sesi.tanggal.toISOString().slice(0, 10);
    const cutoff = new Date(
      wibInstant(dateISO, sesi.jadwal.jamSelesai).getTime() +
        settings.sessionGracePeriodMinutes * 60 * 1000,
    );
    if (now > cutoff) {
      await closeSession(sesi.id, { now });
      closed += 1;
    }
  }
  return closed;
}
