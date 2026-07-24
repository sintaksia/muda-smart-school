import { prisma } from "@/src/lib/prisma";
import type { AbsensiGuru } from "@prisma/client";
import type { ReportTeacherAbsenceInput } from "../types";
import { createCreditEntry } from "./credit";
import { getAttendanceSettings } from "./settings";
import {
  getAdminUserIds,
  getWaliKelasUserId,
  notifyUsers,
} from "./notifications";
import {
  dateOnlyUtc,
  hariFromDateISO,
  toWibParts,
  wibInstant,
} from "../utils/time";

/** Idempotency guard: one auto teacher deduction per jadwal+date. */
async function hasTeacherAutoDeduction(
  guruId: string,
  refNote: string,
): Promise<boolean> {
  const existing = await prisma.creditScore.findFirst({
    where: { guruId, source: "AUTO", type: "PELANGGARAN", note: refNote },
    select: { id: true },
  });
  return existing !== null;
}

/**
 * Process 4 — record a teacher absence (self-report or Admin input) for
 * the teacher's schedule entries on that date, deduct credit for Alpa, and
 * notify affected classes.
 */
export async function reportTeacherAbsence(
  input: ReportTeacherAbsenceInput,
): Promise<{ records: AbsensiGuru[]; error: string | null }> {
  const tanggal = dateOnlyUtc(input.tanggal);
  const hari = hariFromDateISO(input.tanggal);
  if (!hari) {
    return { records: [], error: "Tidak ada jadwal pada hari Minggu" };
  }

  const jadwalList = await prisma.jadwal.findMany({
    where: {
      guruId: input.guruId,
      hari,
      isActive: true,
      ...(input.jadwalIds?.length ? { id: { in: input.jadwalIds } } : {}),
    },
  });
  if (jadwalList.length === 0) {
    return {
      records: [],
      error: "Guru tidak memiliki jadwal pada tanggal ini",
    };
  }

  const settings = await getAttendanceSettings();
  const records: AbsensiGuru[] = [];

  for (const jadwal of jadwalList) {
    const record = await prisma.absensiGuru.upsert({
      where: {
        jadwalId_guruId_tanggal: {
          jadwalId: jadwal.id,
          guruId: input.guruId,
          tanggal,
        },
      },
      update: {
        status: input.status,
        catatan: input.catatan,
        reportedById: input.reportedById,
      },
      create: {
        jadwalId: jadwal.id,
        guruId: input.guruId,
        tanggal,
        status: input.status,
        catatan: input.catatan,
        reportedById: input.reportedById,
      },
    });
    records.push(record);

    if (input.status === "ALPHA") {
      const refNote = `Alpa mengajar ${input.tanggal} jadwal ${jadwal.id}`;
      if (!(await hasTeacherAutoDeduction(input.guruId, refNote))) {
        await createCreditEntry({
          ownerType: "TEACHER",
          guruId: input.guruId,
          type: "PELANGGARAN",
          category: "Kedisiplinan",
          points: settings.creditPoints.alpaTeacher,
          note: refNote,
          source: "AUTO",
        });
      }
    }

    const waliUserId = await getWaliKelasUserId(jadwal.kelasId);
    const students = await prisma.student.findMany({
      where: { classId: jadwal.kelasId, status: "AKTIF" },
      select: { userId: true },
    });
    await notifyUsers(
      [...students.map((s) => s.userId), ...(waliUserId ? [waliUserId] : [])],
      {
        title: "Guru berhalangan hadir",
        body: `Guru berhalangan (${input.status.toLowerCase()}) pada ${input.tanggal}. Menunggu penugasan guru pengganti.`,
        type: "TEACHER_ABSENCE",
        refId: record.id,
      },
    );
  }

  return { records, error: null };
}

/** Process 4 step 4 — Admin assigns a substitute (manual in v1). */
export async function assignSubstitute(
  absensiGuruId: string,
  substituteGuruId: string,
): Promise<{ record: AbsensiGuru | null; error: string | null }> {
  const existing = await prisma.absensiGuru.findUnique({
    where: { id: absensiGuruId },
  });
  if (!existing) {
    return { record: null, error: "Data absensi guru tidak ditemukan" };
  }
  if (existing.guruId === substituteGuruId) {
    return { record: null, error: "Guru pengganti tidak boleh guru yang sama" };
  }
  const record = await prisma.absensiGuru.update({
    where: { id: absensiGuruId },
    data: { substituteGuruId },
  });
  const substitute = await prisma.teacher.findUnique({
    where: { id: substituteGuruId },
    select: { userId: true },
  });
  if (substitute) {
    await notifyUsers([substitute.userId], {
      title: "Anda ditugaskan sebagai guru pengganti",
      body: "Anda dapat membuka sesi QR untuk kelas yang ditinggalkan seperti jadwal Anda sendiri.",
      type: "TEACHER_ABSENCE",
      refId: record.id,
    });
  }
  return { record, error: null };
}

/**
 * Background job — detect scheduled sessions that were never opened and no
 * report filed (retroactive teacher Alpa), and escalate unresolved
 * absences to Admin shortly before the session starts.
 */
export async function detectMissedSessions(
  now: Date = new Date(),
): Promise<number> {
  const settings = await getAttendanceSettings();
  const { dateISO, hari } = toWibParts(now);
  if (!hari) {
    return 0;
  }
  const tanggal = dateOnlyUtc(dateISO);

  const jadwalList = await prisma.jadwal.findMany({
    where: { hari, isActive: true },
    include: {
      sesi: { where: { tanggal } },
      absensiGuru: { where: { tanggal } },
    },
  });

  let flagged = 0;
  for (const jadwal of jadwalList) {
    const endCutoff = new Date(
      wibInstant(dateISO, jadwal.jamSelesai).getTime() +
        settings.sessionGracePeriodMinutes * 60 * 1000,
    );

    // Escalation: absence with no substitute, 15 min before start.
    const absence = jadwal.absensiGuru.find((a) => a.status !== "HADIR");
    const startsSoon =
      now >=
        new Date(wibInstant(dateISO, jadwal.jamMulai).getTime() - 15 * 60000) &&
      now < wibInstant(dateISO, jadwal.jamMulai);
    if (absence && !absence.substituteGuruId && startsSoon) {
      const adminIds = await getAdminUserIds();
      await notifyUsers(adminIds, {
        title: "Guru absen tanpa pengganti",
        body: `Sesi ${jadwal.jamMulai} hari ini belum memiliki guru pengganti.`,
        type: "TEACHER_ABSENCE",
        refId: absence.id,
      });
    }

    // Retroactive Alpa: session over, never opened, nothing reported.
    if (
      now > endCutoff &&
      jadwal.sesi.length === 0 &&
      jadwal.absensiGuru.length === 0
    ) {
      await reportTeacherAbsence({
        guruId: jadwal.guruId,
        tanggal: dateISO,
        status: "ALPHA",
        catatan: "Terdeteksi otomatis: sesi tidak dibuka tanpa laporan",
        jadwalIds: [jadwal.id],
      });
      // Mark the slot as kelas kosong so students are never penalized.
      await prisma.sesi.upsert({
        where: { jadwalId_tanggal: { jadwalId: jadwal.id, tanggal } },
        update: {},
        create: { jadwalId: jadwal.id, tanggal, status: "KELAS_KOSONG" },
      });
      flagged += 1;
    }
  }
  return flagged;
}
