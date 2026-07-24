import { prisma } from "@/src/lib/prisma";
import type { Jadwal } from "@prisma/client";
import type { JadwalInput, JadwalValidationResult } from "../types";
import { getAttendanceSettings } from "./settings";
import {
  parseTimeToMinutes,
  rangeDurationHours,
  timeRangesOverlap,
} from "../utils/time";

/**
 * Process 0 — validate a Schedule entry before save. Returns every violated
 * rule with its specific message; soft warnings never block.
 */
export async function validateJadwal(
  input: JadwalInput,
  excludeJadwalId?: string,
): Promise<JadwalValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const start = parseTimeToMinutes(input.jamMulai);
    const end = parseTimeToMinutes(input.jamSelesai);
    if (end <= start) {
      errors.push("Jam selesai harus setelah jam mulai");
    }
  } catch (err: unknown) {
    errors.push(err instanceof Error ? err.message : "Format jam tidak valid");
    return { valid: false, errors, warnings };
  }

  // Teacher-subject qualification (TeacherSubject mapping).
  const qualification = await prisma.teacherSubject.findUnique({
    where: {
      teacherId_subjectId: {
        teacherId: input.guruId,
        subjectId: input.mataPelajaranId,
      },
    },
  });
  if (!qualification) {
    errors.push("Guru tidak terdaftar untuk mata pelajaran ini");
  }

  // Clash checks against active entries on the same day.
  const sameDay = await prisma.jadwal.findMany({
    where: {
      hari: input.hari,
      isActive: true,
      ...(excludeJadwalId ? { id: { not: excludeJadwalId } } : {}),
      OR: [{ guruId: input.guruId }, { kelasId: input.kelasId }],
    },
  });
  const overlapping = sameDay.filter((entry) =>
    timeRangesOverlap(
      entry.jamMulai,
      entry.jamSelesai,
      input.jamMulai,
      input.jamSelesai,
    ),
  );
  if (overlapping.some((entry) => entry.guruId === input.guruId)) {
    errors.push("Guru bentrok jadwal");
  }
  if (overlapping.some((entry) => entry.kelasId === input.kelasId)) {
    errors.push("Kelas bentrok jadwal");
  }

  // Soft warning: weekly teaching load above MAX_WEEKLY_HOURS.
  const settings = await getAttendanceSettings();
  const weekly = await prisma.jadwal.findMany({
    where: {
      guruId: input.guruId,
      isActive: true,
      ...(excludeJadwalId ? { id: { not: excludeJadwalId } } : {}),
    },
    select: { jamMulai: true, jamSelesai: true },
  });
  const totalHours =
    weekly.reduce(
      (sum, entry) =>
        sum + rangeDurationHours(entry.jamMulai, entry.jamSelesai),
      0,
    ) + rangeDurationHours(input.jamMulai, input.jamSelesai);
  if (totalHours > settings.maxWeeklyHours) {
    warnings.push(
      `Total jam mengajar mingguan guru (${totalHours} jam) melebihi batas ${settings.maxWeeklyHours} jam`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

export async function createJadwal(
  input: JadwalInput,
): Promise<{ jadwal: Jadwal | null; warnings: string[]; errors: string[] }> {
  const validation = await validateJadwal(input);
  if (!validation.valid) {
    return {
      jadwal: null,
      warnings: validation.warnings,
      errors: validation.errors,
    };
  }
  const jadwal = await prisma.jadwal.create({ data: input });
  return { jadwal, warnings: validation.warnings, errors: [] };
}

/**
 * Mid-term change — never mutate the timetable row past records point to:
 * deactivate the old entry and create a new effective version.
 */
export async function updateJadwal(
  id: string,
  input: JadwalInput,
): Promise<{ jadwal: Jadwal | null; warnings: string[]; errors: string[] }> {
  const existing = await prisma.jadwal.findUnique({ where: { id } });
  if (!existing || !existing.isActive) {
    return { jadwal: null, warnings: [], errors: ["Jadwal tidak ditemukan"] };
  }
  const validation = await validateJadwal(input, id);
  if (!validation.valid) {
    return {
      jadwal: null,
      warnings: validation.warnings,
      errors: validation.errors,
    };
  }
  const [, jadwal] = await prisma.$transaction([
    prisma.jadwal.update({ where: { id }, data: { isActive: false } }),
    prisma.jadwal.create({ data: input }),
  ]);
  return { jadwal, warnings: validation.warnings, errors: [] };
}

export async function deactivateJadwal(id: string): Promise<Jadwal | null> {
  const existing = await prisma.jadwal.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }
  return prisma.jadwal.update({ where: { id }, data: { isActive: false } });
}
