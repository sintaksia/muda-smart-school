import { prisma } from "@/src/lib/prisma";
import type { TeacherAttendance } from "@prisma/client";
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
  dayOfWeekFromDateISO,
  toWibParts,
  wibInstant,
} from "../utils/time";

/** Idempotency guard: one auto teacher deduction per jadwal+date. */
async function hasTeacherAutoDeduction(
  teacherId: string,
  refNote: string,
): Promise<boolean> {
  const existing = await prisma.creditScore.findFirst({
    where: { teacherId, source: "AUTO", type: "VIOLATION", note: refNote },
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
): Promise<{ records: TeacherAttendance[]; error: string | null }> {
  const date = dateOnlyUtc(input.date);
  const dayOfWeek = dayOfWeekFromDateISO(input.date);
  if (!dayOfWeek) {
    return { records: [], error: "Tidak ada jadwal pada hari Minggu" };
  }

  const jadwalList = await prisma.schedule.findMany({
    where: {
      teacherId: input.teacherId,
      dayOfWeek,
      isActive: true,
      ...(input.scheduleIds?.length ? { id: { in: input.scheduleIds } } : {}),
    },
  });
  if (jadwalList.length === 0) {
    return {
      records: [],
      error: "Guru tidak memiliki jadwal pada tanggal ini",
    };
  }

  const settings = await getAttendanceSettings();
  const records: TeacherAttendance[] = [];

  for (const jadwal of jadwalList) {
    const record = await prisma.teacherAttendance.upsert({
      where: {
        scheduleId_teacherId_date: {
          scheduleId: jadwal.id,
          teacherId: input.teacherId,
          date,
        },
      },
      update: {
        status: input.status,
        note: input.note,
        reportedById: input.reportedById,
      },
      create: {
        scheduleId: jadwal.id,
        teacherId: input.teacherId,
        date,
        status: input.status,
        note: input.note,
        reportedById: input.reportedById,
      },
    });
    records.push(record);

    if (input.status === "ABSENT") {
      const refNote = `Alpa mengajar ${input.date} jadwal ${jadwal.id}`;
      if (!(await hasTeacherAutoDeduction(input.teacherId, refNote))) {
        await createCreditEntry({
          ownerType: "TEACHER",
          teacherId: input.teacherId,
          type: "VIOLATION",
          category: "Kedisiplinan",
          points: settings.creditPoints.alpaTeacher,
          note: refNote,
          source: "AUTO",
        });
      }
    }

    const waliUserId = await getWaliKelasUserId(jadwal.classId);
    const students = await prisma.student.findMany({
      where: { classId: jadwal.classId, status: "AKTIF" },
      select: { userId: true },
    });
    await notifyUsers(
      [...students.map((s) => s.userId), ...(waliUserId ? [waliUserId] : [])],
      {
        title: "Guru berhalangan hadir",
        body: `Guru berhalangan (${input.status.toLowerCase()}) pada ${input.date}. Menunggu penugasan guru pengganti.`,
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
  substituteTeacherId: string,
): Promise<{ record: TeacherAttendance | null; error: string | null }> {
  const existing = await prisma.teacherAttendance.findUnique({
    where: { id: absensiGuruId },
  });
  if (!existing) {
    return { record: null, error: "Data absensi guru tidak ditemukan" };
  }
  if (existing.teacherId === substituteTeacherId) {
    return { record: null, error: "Guru pengganti tidak boleh guru yang sama" };
  }
  const record = await prisma.teacherAttendance.update({
    where: { id: absensiGuruId },
    data: { substituteTeacherId },
  });
  const substitute = await prisma.teacher.findUnique({
    where: { id: substituteTeacherId },
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
  const { dateISO, dayOfWeek } = toWibParts(now);
  if (!dayOfWeek) {
    return 0;
  }
  const date = dateOnlyUtc(dateISO);

  const jadwalList = await prisma.schedule.findMany({
    where: { dayOfWeek, isActive: true },
    include: {
      sessions: { where: { date } },
      teacherAttendance: { where: { date } },
    },
  });

  let flagged = 0;
  for (const jadwal of jadwalList) {
    const endCutoff = new Date(
      wibInstant(dateISO, jadwal.endTime).getTime() +
        settings.sessionGracePeriodMinutes * 60 * 1000,
    );

    // Escalation: absence with no substitute, 15 min before start.
    const absence = jadwal.teacherAttendance.find(
      (a) => a.status !== "PRESENT",
    );
    const startsSoon =
      now >=
        new Date(
          wibInstant(dateISO, jadwal.startTime).getTime() - 15 * 60000,
        ) && now < wibInstant(dateISO, jadwal.startTime);
    if (absence && !absence.substituteTeacherId && startsSoon) {
      const adminIds = await getAdminUserIds();
      await notifyUsers(adminIds, {
        title: "Guru absen tanpa pengganti",
        body: `Sesi ${jadwal.startTime} hari ini belum memiliki guru pengganti.`,
        type: "TEACHER_ABSENCE",
        refId: absence.id,
      });
    }

    // Retroactive Alpa: session over, never opened, nothing reported.
    if (
      now > endCutoff &&
      jadwal.sessions.length === 0 &&
      jadwal.teacherAttendance.length === 0
    ) {
      await reportTeacherAbsence({
        teacherId: jadwal.teacherId,
        date: dateISO,
        status: "ABSENT",
        note: "Terdeteksi otomatis: sesi tidak dibuka tanpa laporan",
        scheduleIds: [jadwal.id],
      });
      // Mark the slot as kelas kosong so students are never penalized.
      await prisma.session.upsert({
        where: { scheduleId_date: { scheduleId: jadwal.id, date } },
        update: {},
        create: { scheduleId: jadwal.id, date, status: "NO_CLASS" },
      });
      flagged += 1;
    }
  }
  return flagged;
}
