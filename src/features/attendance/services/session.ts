import { prisma } from "@/src/lib/prisma";
import type { Session } from "@prisma/client";
import { getAttendanceSettings } from "./settings";
import { processSessionDeductions } from "./deduction";
import { notifyUsers, getWaliKelasUserId } from "./notifications";
import { generateQrToken } from "../utils/qr";
import { dateOnlyUtc, toWibParts, wibInstant } from "../utils/time";

export interface OpenSessionResult {
  session: Session | null;
  error: string | null;
}

/**
 * Process 1 — open a class session for today. Handles the teacher-absence
 * edge case: with an unresolved absence and no substitute the session is
 * recorded as NO_CLASS (no QR, no student penalty).
 */
export async function openSession(
  scheduleId: string,
  options: { byTeacherId?: string; now?: Date } = {},
): Promise<OpenSessionResult> {
  const now = options.now ?? new Date();
  const { dateISO, dayOfWeek } = toWibParts(now);
  const date = dateOnlyUtc(dateISO);

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      schoolClass: { include: { students: { where: { status: "ACTIVE" } } } },
    },
  });
  if (!schedule || !schedule.isActive) {
    return { session: null, error: "Jadwal tidak ditemukan" };
  }
  if (schedule.dayOfWeek !== dayOfWeek) {
    return { session: null, error: "Jadwal bukan untuk hari ini" };
  }

  const existing = await prisma.session.findUnique({
    where: { scheduleId_date: { scheduleId, date } },
  });
  if (existing) {
    if (existing.status === "OPEN") {
      return { session: existing, error: null };
    }
    return { session: existing, error: "Sesi sudah ditutup" };
  }

  // Teacher absence check (Process 1 edge case / Process 4 step 4).
  const teacherAbsence = await prisma.teacherAttendance.findUnique({
    where: {
      scheduleId_teacherId_date: {
        scheduleId,
        teacherId: schedule.teacherId,
        date,
      },
    },
  });
  const isAbsent =
    teacherAbsence !== null && teacherAbsence.status !== "PRESENT";

  if (isAbsent && !teacherAbsence.substituteTeacherId) {
    const session = await prisma.session.create({
      data: { scheduleId, date, status: "NO_CLASS" },
    });
    const studentUserIds = schedule.schoolClass.students.map(
      (student) => student.userId,
    );
    const waliUserId = await getWaliKelasUserId(schedule.classId);
    await notifyUsers(
      [...studentUserIds, ...(waliUserId ? [waliUserId] : [])],
      {
        title: "Kelas kosong",
        body: `Guru berhalangan hadir dan belum ada pengganti. Sesi ${dateISO} ditandai kelas kosong.`,
        type: "NO_CLASS",
        refId: session.id,
      },
    );
    return { session, error: null };
  }

  const actualTeacherId =
    isAbsent && teacherAbsence.substituteTeacherId
      ? teacherAbsence.substituteTeacherId
      : (options.byTeacherId ?? schedule.teacherId);

  const session = await prisma.session.create({
    data: {
      scheduleId,
      date,
      status: "OPEN",
      openedAt: now,
      qrToken: generateQrToken(),
      qrTokenIssuedAt: now,
      actualTeacherId,
    },
  });
  return { session, error: null };
}

/** Rotate the QR token (DYNAMIC mode, Process 1 step 3). */
export async function refreshQrToken(
  sessionId: string,
): Promise<Session | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  if (!session || session.status !== "OPEN") {
    return null;
  }
  return prisma.session.update({
    where: { id: sessionId },
    data: { qrToken: generateQrToken(), qrTokenIssuedAt: new Date() },
  });
}

/**
 * Process 1 step 6 — close a session and trigger Process 3 deductions.
 */
export async function closeSession(
  sessionId: string,
  options: { now?: Date } = {},
): Promise<{ session: Session | null; error: string | null }> {
  const existing = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  if (!existing) {
    return { session: null, error: "Sesi tidak ditemukan" };
  }
  if (existing.status !== "OPEN") {
    return { session: existing, error: "Sesi sudah ditutup" };
  }
  const session = await prisma.session.update({
    where: { id: sessionId },
    data: { status: "CLOSED", closedAt: options.now ?? new Date() },
  });
  await processSessionDeductions(sessionId);
  return { session, error: null };
}

/**
 * Background job — auto-close every OPEN session past
 * scheduled_end + SESSION_GRACE_PERIOD_MINUTES.
 */
export async function autoCloseDueSessions(
  now: Date = new Date(),
): Promise<number> {
  const settings = await getAttendanceSettings();
  const openSessions = await prisma.session.findMany({
    where: { status: "OPEN" },
    include: { schedule: { select: { endTime: true } } },
  });

  let closed = 0;
  for (const session of openSessions) {
    const dateISO = session.date.toISOString().slice(0, 10);
    const cutoff = new Date(
      wibInstant(dateISO, session.schedule.endTime).getTime() +
        settings.sessionGracePeriodMinutes * 60 * 1000,
    );
    if (now > cutoff) {
      await closeSession(session.id, { now });
      closed += 1;
    }
  }
  return closed;
}
