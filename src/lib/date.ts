/**
 * Date helpers shared across features. The display format lives here — not in
 * a feature or a page — because every date shown to a user must read the same
 * way. See docs/design_system.md §6.1 for the form-control side.
 */

import { format, isValid, parse } from "date-fns";

/**
 * Canonical string form of a date-only value: `yyyy-MM-dd`. Matches what a
 * native date input emits, so it stays wire-compatible with the Zod schemas
 * and API routes that already expect that shape.
 */
export const DATE_VALUE_FORMAT = "yyyy-MM-dd";

/** Format tanggal untuk display, mis. "15 Januari 2025". */
export function formatTanggal(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Parse a `yyyy-MM-dd` value into a Date at local midnight. Returns
 * `undefined` for empty or malformed input so a half-typed value never
 * becomes an Invalid Date.
 *
 * Parsing via date-fns rather than `new Date(value)` is deliberate: the latter
 * reads a bare `yyyy-MM-dd` as UTC, which lands on the previous day for every
 * user east of Greenwich — including all of Indonesia.
 */
export function parseDateValue(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, DATE_VALUE_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

/** Serialize a Date back to `yyyy-MM-dd`, in local time (never UTC-shifted). */
export function toDateValue(date: Date): string {
  return format(date, DATE_VALUE_FORMAT);
}
