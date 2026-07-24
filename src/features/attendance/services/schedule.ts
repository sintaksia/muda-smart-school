import { prisma } from "@/src/lib/prisma";
import type { Schedule } from "@prisma/client";
import type { ScheduleInput, ScheduleValidationResult } from "../types";
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
export async function validateSchedule(
  input: ScheduleInput,
  excludeScheduleId?: string,
): Promise<ScheduleValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const start = parseTimeToMinutes(input.startTime);
    const end = parseTimeToMinutes(input.endTime);
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
        teacherId: input.teacherId,
        subjectId: input.subjectId,
      },
    },
  });
  if (!qualification) {
    errors.push("Guru tidak terdaftar untuk mata pelajaran ini");
  }

  // Clash checks against active entries on the same day.
  const sameDay = await prisma.schedule.findMany({
    where: {
      dayOfWeek: input.dayOfWeek,
      isActive: true,
      ...(excludeScheduleId ? { id: { not: excludeScheduleId } } : {}),
      OR: [{ teacherId: input.teacherId }, { classId: input.classId }],
    },
  });
  const overlapping = sameDay.filter((entry) =>
    timeRangesOverlap(
      entry.startTime,
      entry.endTime,
      input.startTime,
      input.endTime,
    ),
  );
  if (overlapping.some((entry) => entry.teacherId === input.teacherId)) {
    errors.push("Guru bentrok jadwal");
  }
  if (overlapping.some((entry) => entry.classId === input.classId)) {
    errors.push("Kelas bentrok jadwal");
  }

  // Soft warning: weekly teaching load above MAX_WEEKLY_HOURS.
  const settings = await getAttendanceSettings();
  const weekly = await prisma.schedule.findMany({
    where: {
      teacherId: input.teacherId,
      isActive: true,
      ...(excludeScheduleId ? { id: { not: excludeScheduleId } } : {}),
    },
    select: { startTime: true, endTime: true },
  });
  const totalHours =
    weekly.reduce(
      (sum, entry) => sum + rangeDurationHours(entry.startTime, entry.endTime),
      0,
    ) + rangeDurationHours(input.startTime, input.endTime);
  if (totalHours > settings.maxWeeklyHours) {
    warnings.push(
      `Total jam mengajar mingguan guru (${totalHours} jam) melebihi batas ${settings.maxWeeklyHours} jam`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

export async function createSchedule(input: ScheduleInput): Promise<{
  schedule: Schedule | null;
  warnings: string[];
  errors: string[];
}> {
  const validation = await validateSchedule(input);
  if (!validation.valid) {
    return {
      schedule: null,
      warnings: validation.warnings,
      errors: validation.errors,
    };
  }
  const schedule = await prisma.schedule.create({ data: input });
  return { schedule, warnings: validation.warnings, errors: [] };
}

/**
 * Mid-term change — never mutate the timetable row past records point to:
 * deactivate the old entry and create a new effective version.
 */
export async function updateSchedule(
  id: string,
  input: ScheduleInput,
): Promise<{
  schedule: Schedule | null;
  warnings: string[];
  errors: string[];
}> {
  const existing = await prisma.schedule.findUnique({ where: { id } });
  if (!existing || !existing.isActive) {
    return { schedule: null, warnings: [], errors: ["Jadwal tidak ditemukan"] };
  }
  const validation = await validateSchedule(input, id);
  if (!validation.valid) {
    return {
      schedule: null,
      warnings: validation.warnings,
      errors: validation.errors,
    };
  }
  const [, schedule] = await prisma.$transaction([
    prisma.schedule.update({ where: { id }, data: { isActive: false } }),
    prisma.schedule.create({ data: input }),
  ]);
  return { schedule, warnings: validation.warnings, errors: [] };
}

export async function deactivateSchedule(id: string): Promise<Schedule | null> {
  const existing = await prisma.schedule.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }
  return prisma.schedule.update({ where: { id }, data: { isActive: false } });
}
