import { prisma } from "@/src/lib/prisma";
import type { AbsensiSiswa, AbsensiStatus } from "@prisma/client";
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
  const sesi = await prisma.sesi.findUnique({
    where: { qrToken: input.token },
    include: { jadwal: true },
  });
  if (
    !sesi ||
    isQrTokenExpired(
      settings.qrMode,
      sesi.qrTokenIssuedAt,
      settings.qrTokenTtlSeconds,
      now,
    )
  ) {
    return { ok: false, error: "QR kedaluwarsa, minta guru me-refresh QR" };
  }

  // 2. Session check
  if (sesi.status !== "OPEN") {
    return { ok: false, error: "Tidak ada sesi aktif" };
  }

  // 3. Enrollment check
  const student = await prisma.student.findUnique({
    where: { userId: input.studentUserId },
  });
  if (!student || student.classId !== sesi.jadwal.kelasId) {
    return { ok: false, error: "Tidak terdaftar di kelas ini" };
  }

  // 4. Duplicate check — idempotent no-op, not an error.
  const existing = await prisma.absensiSiswa.findUnique({
    where: {
      jadwalId_studentId_tanggal: {
        jadwalId: sesi.jadwalId,
        studentId: student.id,
        tanggal: sesi.tanggal,
      },
    },
  });
  if (existing) {
    return { ok: true, status: existing.status, needsReview: false };
  }

  // 5. Time evaluation
  const dateISO = sesi.tanggal.toISOString().slice(0, 10);
  const graceCutoff = new Date(
    wibInstant(dateISO, sesi.jadwal.jamMulai).getTime() +
      settings.sessionGracePeriodMinutes * 60 * 1000,
  );
  const status: AbsensiStatus = now <= graceCutoff ? "HADIR" : "TERLAMBAT";

  // 6. GPS evaluation — soft check, never blocks.
  const gps = evaluateGps(
    input.gpsLat,
    input.gpsLng,
    settings.gpsSchoolLat,
    settings.gpsSchoolLng,
    settings.gpsRadiusMeters,
  );

  await prisma.absensiSiswa.create({
    data: {
      jadwalId: sesi.jadwalId,
      studentId: student.id,
      sesiId: sesi.id,
      tanggal: sesi.tanggal,
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
  if (gps.needsReview && sesi.actualGuruId) {
    const guru = await prisma.teacher.findUnique({
      where: { id: sesi.actualGuruId },
      select: { userId: true },
    });
    if (guru) {
      await createNotification({
        userId: guru.userId,
        title: "Scan perlu ditinjau",
        body: "Ada presensi dengan GPS di luar radius sekolah. Mohon konfirmasi di layar sesi.",
        type: "GPS_REVIEW",
        refId: sesi.id,
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
  update: { status?: AbsensiStatus; catatan?: string; clearReview?: boolean },
): Promise<AbsensiSiswa | null> {
  const record = await prisma.absensiSiswa.findUnique({
    where: { id: absensiId },
  });
  if (!record) {
    return null;
  }
  return prisma.absensiSiswa.update({
    where: { id: absensiId },
    data: {
      status: update.status ?? record.status,
      catatan: update.catatan ?? record.catatan,
      needsReview: update.clearReview ? false : record.needsReview,
    },
  });
}

/** Teacher marks a non-scanner manually (e.g. verbal izin) while open. */
export async function markManualAttendance(
  sesiId: string,
  studentId: string,
  status: AbsensiStatus,
  catatan?: string,
): Promise<{ record: AbsensiSiswa | null; error: string | null }> {
  const sesi = await prisma.sesi.findUnique({ where: { id: sesiId } });
  if (!sesi || sesi.status !== "OPEN") {
    return { record: null, error: "Tidak ada sesi aktif" };
  }
  const existing = await prisma.absensiSiswa.findUnique({
    where: {
      jadwalId_studentId_tanggal: {
        jadwalId: sesi.jadwalId,
        studentId,
        tanggal: sesi.tanggal,
      },
    },
  });
  if (existing) {
    return { record: existing, error: "Sudah tercatat" };
  }
  const record = await prisma.absensiSiswa.create({
    data: {
      jadwalId: sesi.jadwalId,
      studentId,
      sesiId: sesi.id,
      tanggal: sesi.tanggal,
      status,
      catatan,
      method: "MANUAL",
    },
  });
  return { record, error: null };
}
