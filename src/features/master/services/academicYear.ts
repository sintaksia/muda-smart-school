import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  ACADEMIC_SETTINGS_GROUP,
  ACADEMIC_SETTING_DEFINITIONS,
  ACTIVE_ACADEMIC_YEAR_KEY,
} from "../constants";
import { academicYearForDate, isAcademicYear } from "../utils/promotion";

/**
 * The academic year the school is currently running. Falls back to the year
 * today's date sits in, so every screen has a sensible default before an admin
 * has ever opened the setting — and a stored value that has gone malformed
 * (hand-edited row, failed migration) never propagates into a query.
 */
export async function getActiveAcademicYear(): Promise<string> {
  const row = await prisma.schoolSetting.findUnique({
    where: { key: ACTIVE_ACADEMIC_YEAR_KEY },
    select: { value: true },
  });
  const stored = row?.value?.trim() ?? "";
  return isAcademicYear(stored) ? stored : academicYearForDate(new Date());
}

/**
 * Upsert arguments for the active-year row. Shared so a promotion, which has to
 * move the year inside its own transaction, writes the row exactly the way
 * setActiveAcademicYear does.
 *
 * Upsert, not update: the row does not exist until it is seeded or saved for
 * the first time.
 */
export function activeAcademicYearUpsert(
  value: string,
): Prisma.SchoolSettingUpsertArgs {
  const definition = ACADEMIC_SETTING_DEFINITIONS.find(
    (item) => item.key === ACTIVE_ACADEMIC_YEAR_KEY,
  );
  return {
    where: { key: ACTIVE_ACADEMIC_YEAR_KEY },
    update: { value },
    create: {
      key: ACTIVE_ACADEMIC_YEAR_KEY,
      value,
      label: definition?.label ?? ACTIVE_ACADEMIC_YEAR_KEY,
      type: definition?.type ?? "TEXT",
      group: ACADEMIC_SETTINGS_GROUP,
      order: 0,
    },
  };
}

export async function setActiveAcademicYear(
  value: string,
): Promise<{ ok: boolean; error: string | null }> {
  if (!isAcademicYear(value)) {
    return { ok: false, error: "Format tahun ajaran: 2026/2027" };
  }
  await prisma.schoolSetting.upsert(activeAcademicYearUpsert(value));
  return { ok: true, error: null };
}
