import type { PromotionAction } from "@prisma/client";
import { ACADEMIC_YEAR_START_MONTH } from "../constants";

export const ACADEMIC_YEAR_PATTERN = /^\d{4}\/\d{4}$/;

/** Grade levels in ascending order, matching gradeLevelOptions. */
const FIRST_GRADE_LEVEL = 10;
const FINAL_GRADE_LEVEL = 12;

const ROMAN_BY_GRADE_LEVEL: Record<number, string> = {
  10: "X",
  11: "XI",
  12: "XII",
};

export interface PromotionClassRef {
  id: string;
  name: string;
  gradeLevel: number;
  specialization: string;
}

/** A well-formed year runs to exactly the next calendar year: "2025/2026". */
export function isAcademicYear(value: string): boolean {
  if (!ACADEMIC_YEAR_PATTERN.test(value)) {
    return false;
  }
  const [start, end] = value.split("/").map(Number);
  return end === start + 1;
}

/**
 * The academic year a date falls in. July onwards belongs to the year that
 * starts in that calendar year; earlier months still belong to the previous one.
 */
export function academicYearForDate(date: Date): string {
  const year = date.getFullYear();
  const start =
    date.getMonth() + 1 >= ACADEMIC_YEAR_START_MONTH ? year : year - 1;
  return `${start}/${start + 1}`;
}

export function nextAcademicYear(academicYear: string): string {
  if (!isAcademicYear(academicYear)) {
    throw new Error(`Tahun ajaran tidak valid: ${academicYear}`);
  }
  const start = Number(academicYear.split("/")[0]) + 1;
  return `${start}/${start + 1}`;
}

/** 10 → 11, 11 → 12, 12 → null (the student graduates instead). */
export function nextGradeLevel(gradeLevel: number): number | null {
  if (gradeLevel < FIRST_GRADE_LEVEL || gradeLevel >= FINAL_GRADE_LEVEL) {
    return null;
  }
  return gradeLevel + 1;
}

export function defaultPromotionAction(gradeLevel: number): PromotionAction {
  return nextGradeLevel(gradeLevel) === null ? "GRADUATE" : "PROMOTE";
}

export function romanGradeLevel(gradeLevel: number): string {
  return ROMAN_BY_GRADE_LEVEL[gradeLevel] ?? String(gradeLevel);
}

/**
 * The rombel number a class name ends in — "X PPLG 1" → 1, "XI TKR" → null.
 * Used so a class lands on its own counterpart next year instead of whichever
 * class of that grade happens to sort first.
 */
export function classGroupIndex(name: string): number | null {
  const match = name.trim().match(/(\d+)$/);
  return match ? Number(match[1]) : null;
}

/**
 * Rename a class for its next grade level: "X PPLG 1" → "XI PPLG 1". Only the
 * leading roman numeral is touched, so the rombel and specialization survive.
 */
export function renameClassForGradeLevel(
  name: string,
  fromGradeLevel: number,
  toGradeLevel: number,
): string {
  const from = romanGradeLevel(fromGradeLevel);
  const to = romanGradeLevel(toGradeLevel);
  const pattern = new RegExp(`^${from}(?=\\s|$)`);
  return pattern.test(name.trim())
    ? name.trim().replace(pattern, to)
    : `${to} ${name.trim()}`;
}

/**
 * Suggested destination class: same specialization, the given grade level, and
 * the same rombel number where both sides have one. Falls back to the only
 * candidate when a specialization has just one class, and returns null when the
 * choice would be a guess — the admin picks it manually instead.
 */
export function suggestTargetClass(
  source: PromotionClassRef,
  targetGradeLevel: number,
  candidates: PromotionClassRef[],
): string | null {
  const matches = candidates.filter(
    (candidate) =>
      candidate.gradeLevel === targetGradeLevel &&
      candidate.specialization === source.specialization,
  );
  if (matches.length === 0) {
    return null;
  }
  if (matches.length === 1) {
    return matches[0].id;
  }
  const sourceIndex = classGroupIndex(source.name);
  const sameRombel = matches.find(
    (candidate) =>
      sourceIndex !== null && classGroupIndex(candidate.name) === sourceIndex,
  );
  return sameRombel?.id ?? null;
}
