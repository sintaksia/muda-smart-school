import type { DayOfWeek } from "@prisma/client";

/**
 * All schedule times are wall-clock in the school's timezone (WIB, UTC+7 —
 * fixed offset, no DST). Dates are stored as UTC midnight of the WIB date.
 */
export const WIB_OFFSET_MINUTES = 7 * 60;

const DAY_OF_WEEK_BY_JS_DAY: Record<number, DayOfWeek | null> = {
  0: null, // Minggu — no schedule
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

/** Parse "HH:mm" into minutes since midnight. Throws on malformed input. */
export function parseTimeToMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) {
    throw new Error(`Format jam tidak valid: "${time}" (harus HH:mm)`);
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    throw new Error(`Format jam tidak valid: "${time}" (harus HH:mm)`);
  }
  return hours * 60 + minutes;
}

/** True when two [start, end) time ranges (HH:mm) overlap. */
export function timeRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const a1 = parseTimeToMinutes(startA);
  const a2 = parseTimeToMinutes(endA);
  const b1 = parseTimeToMinutes(startB);
  const b2 = parseTimeToMinutes(endB);
  return a1 < b2 && b1 < a2;
}

/** Duration of a HH:mm range in hours (fractional). */
export function rangeDurationHours(start: string, end: string): number {
  return (parseTimeToMinutes(end) - parseTimeToMinutes(start)) / 60;
}

/** Current date parts in WIB for a given instant. */
export function toWibParts(instant: Date): {
  dateISO: string;
  minutesOfDay: number;
  dayOfWeek: DayOfWeek | null;
} {
  const shifted = new Date(instant.getTime() + WIB_OFFSET_MINUTES * 60 * 1000);
  const dateISO = shifted.toISOString().slice(0, 10);
  const minutesOfDay = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
  return {
    dateISO,
    minutesOfDay,
    dayOfWeek: DAY_OF_WEEK_BY_JS_DAY[shifted.getUTCDay()],
  };
}

/** UTC-midnight Date for a WIB calendar date "YYYY-MM-DD" (storage form). */
export function dateOnlyUtc(dateISO: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    throw new Error(`Format tanggal tidak valid: "${dateISO}"`);
  }
  return new Date(`${dateISO}T00:00:00.000Z`);
}

/** Absolute instant of a WIB date + "HH:mm" wall-clock time. */
export function wibInstant(dateISO: string, time: string): Date {
  const minutes = parseTimeToMinutes(time);
  const base = dateOnlyUtc(dateISO).getTime();
  return new Date(base + (minutes - WIB_OFFSET_MINUTES) * 60 * 1000);
}

/** DayOfWeek for a WIB calendar date. */
export function dayOfWeekFromDateISO(dateISO: string): DayOfWeek | null {
  return DAY_OF_WEEK_BY_JS_DAY[dateOnlyUtc(dateISO).getUTCDay()];
}
