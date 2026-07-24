import { prisma } from "@/src/lib/prisma";
import type { StudentAttendance, AttendanceStatus } from "@prisma/client";
import type { ScanInput, ScanResult } from "../types";
import { getAttendanceSettings } from "./settings";
import { createNotification } from "./notifications";
import { evaluateGps } from "../utils/gps";
import { isQrTokenExpired } from "../utils/qr";
import { wibInstant } from "../utils/time";

/**
 * Process 2 — student QR scan. Validations run in the documented order and
 * stop at the first failure with its specific error.
 */
export async function recordScan(
  input: ScanInput,
  now: Date = new Date(),
): Promise<ScanResult> {
  const settings = await getAttendanceSettings();

  // 1. Token check
  const session = await prisma.session.findUnique({
    where: { qrToken: input.token },
    include: { schedule: true },
  });
  if (
    !session ||
    isQrTokenExpired(
      settings.qrMode,
      session.qrTokenIssuedAt,
      settings.qrTokenTtlSeconds,
      now,
    )
  ) {
    return { ok: false, error: "QR kedaluwarsa, minta guru me-refresh QR" };
  }

  // 2. Session check
  if (session.status !== "OPEN") {
    return { ok: false, error: "Tidak ada sesi aktif" };
  }

  // 3. Enrollment check
  const student = await prisma.student.findUnique({
    where: { userId: input.studentUserId },
  });
  if (!student || student.classId !== session.schedule.classId) {
    return { ok: false, error: "Tidak terdaftar di kelas ini" };
  }

  // 4. Duplicate check — idempotent no-op, not an error.
  const existing = await prisma.studentAttendance.findUnique({
    where: {
      scheduleId_studentId_date: {
        scheduleId: session.scheduleId,
        studentId: student.id,
        date: session.date,
      },
    },
  });
  if (existing) {
    return { ok: true, status: existing.status, needsReview: false };
  }

  // 5. Time evaluation
  const dateISO = session.date.toISOString().slice(0, 10);
  const graceCutoff = new Date(
    wibInstant(dateISO, session.schedule.startTime).getTime() +
      settings.sessionGracePeriodMinutes * 60 * 1000,
  );
  const status: AttendanceStatus = now <= graceCutoff ? "PRESENT" : "LATE";

  // 6. GPS evaluation — soft check, never blocks.
  const gps = evaluateGps(
    input.gpsLat,
    input.gpsLng,
    settings.gpsSchoolLat,
    settings.gpsSchoolLng,
    settings.gpsRadiusMeters,
  );

  await prisma.studentAttendance.create({
    data: {
      scheduleId: session.scheduleId,
      studentId: student.id,
      sessionId: session.id,
      date: session.date,
      status,
      scanTime: now,
      gpsLat: input.gpsLat,
      gpsLng: input.gpsLng,
      gpsValid: gps.gpsValid,
      needsReview: gps.needsReview,
      method: "QR",
    },
  });

  // Process 7 — GPS-flagged scans notify the session's teacher.
  if (gps.needsReview && session.actualTeacherId) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: session.actualTeacherId },
      select: { userId: true },
    });
    if (teacher) {
      await createNotification({
        userId: teacher.userId,
        title: "Scan perlu ditinjau",
        body: "Ada presensi dengan GPS di luar radius sekolah. Mohon konfirmasi di layar sesi.",
        type: "GPS_REVIEW",
        refId: session.id,
      });
    }
  }

  return { ok: true, status, needsReview: gps.needsReview };
}

/**
 * Teacher-side reconciliation — override any record in the live session
 * view (confirm flagged GPS, mark verbal izin, fix status).
 */
export async function overrideAttendance(
  absensiId: string,
  update: {
    status?: AttendanceStatus;
    note?: string;
    clearReview?: boolean;
  },
): Promise<StudentAttendance | null> {
  const record = await prisma.studentAttendance.findUnique({
    where: { id: absensiId },
  });
  if (!record) {
    return null;
  }
  return prisma.studentAttendance.update({
    where: { id: absensiId },
    data: {
      status: update.status ?? record.status,
      note: update.note ?? record.note,
      needsReview: update.clearReview ? false : record.needsReview,
    },
  });
}

/** Teacher marks a non-scanner manually (e.g. verbal izin) while open. */
export async function markManualAttendance(
  sessionId: string,
  studentId: string,
  status: AttendanceStatus,
  note?: string,
): Promise<{ record: StudentAttendance | null; error: string | null }> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  if (!session || session.status !== "OPEN") {
    return { record: null, error: "Tidak ada sesi aktif" };
  }
  const existing = await prisma.studentAttendance.findUnique({
    where: {
      scheduleId_studentId_date: {
        scheduleId: session.scheduleId,
        studentId,
        date: session.date,
      },
    },
  });
  if (existing) {
    return { record: existing, error: "Sudah tercatat" };
  }
  const record = await prisma.studentAttendance.create({
    data: {
      scheduleId: session.scheduleId,
      studentId,
      sessionId: session.id,
      date: session.date,
      status,
      note,
      method: "MANUAL",
    },
  });
  return { record, error: null };
}
