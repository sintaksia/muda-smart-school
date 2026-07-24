import { parseTimeToMinutes, timeRangesOverlap } from "./time";

/** A denormalized schedule row as rendered by the admin timetable UI. */
export interface JadwalEntry {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  subjectName: string;
}

/** An empty interval between two sessions of the same entity on one day. */
export interface JadwalGap {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

/** Per-entity × per-day rollup used by the overview heatmap. */
export interface DaySummary {
  sessionCount: number;
  totalHours: number;
  hasConflict: boolean;
  gapCount: number;
}

/**
 * Sorted unique "HH:mm" boundaries (starts + ends) across all entries —
 * consecutive pairs form the grid's time rows.
 */
export function buildTimeBoundaries(entries: JadwalEntry[]): string[] {
  const boundaries = new Set<string>();
  for (const entry of entries) {
    boundaries.add(entry.startTime);
    boundaries.add(entry.endTime);
  }
  return Array.from(boundaries).sort(
    (a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b),
  );
}

/**
 * Ids of entries that clash: same teacher or same class, same day, overlapping
 * time ranges. Mirrors the server-side validation in services/schedule.ts.
 */
export function findConflictIds(entries: JadwalEntry[]): Set<string> {
  const conflictIds = new Set<string>();
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      if (a.dayOfWeek !== b.dayOfWeek) continue;
      if (a.teacherId !== b.teacherId && a.classId !== b.classId) continue;
      if (timeRangesOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
        conflictIds.add(a.id);
        conflictIds.add(b.id);
      }
    }
  }
  return conflictIds;
}

/**
 * Empty intervals between the first and last session of each day for one
 * entity's entries (pass entries already filtered to a class or teacher).
 */
export function findGaps(entries: JadwalEntry[]): JadwalGap[] {
  const byDay = new Map<string, JadwalEntry[]>();
  for (const entry of entries) {
    const list = byDay.get(entry.dayOfWeek) ?? [];
    list.push(entry);
    byDay.set(entry.dayOfWeek, list);
  }

  const gaps: JadwalGap[] = [];
  for (const [dayOfWeek, dayEntries] of byDay) {
    const sorted = [...dayEntries].sort(
      (a, b) =>
        parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime),
    );
    let coveredUntil = parseTimeToMinutes(sorted[0].startTime);
    let coveredUntilLabel = sorted[0].startTime;
    for (const entry of sorted) {
      const start = parseTimeToMinutes(entry.startTime);
      if (start > coveredUntil) {
        gaps.push({
          dayOfWeek,
          startTime: coveredUntilLabel,
          endTime: entry.startTime,
        });
      }
      const end = parseTimeToMinutes(entry.endTime);
      if (end > coveredUntil) {
        coveredUntil = end;
        coveredUntilLabel = entry.endTime;
      }
    }
  }
  return gaps;
}

/**
 * Heatmap rollup: for each entity (keyed by classId or teacherId) and day,
 * session count, total hours, conflict flag, and gap count. Gaps are only
 * meaningful for classes (a class should have no idle time between sessions).
 */
export function summarizeByEntity(
  entries: JadwalEntry[],
  entityKey: "classId" | "teacherId",
): Map<string, Map<string, DaySummary>> {
  const conflictIds = findConflictIds(entries);
  const byEntity = new Map<string, JadwalEntry[]>();
  for (const entry of entries) {
    const key = entry[entityKey];
    const list = byEntity.get(key) ?? [];
    list.push(entry);
    byEntity.set(key, list);
  }

  const result = new Map<string, Map<string, DaySummary>>();
  for (const [entityId, entityEntries] of byEntity) {
    const gaps = findGaps(entityEntries);
    const days = new Map<string, DaySummary>();
    for (const entry of entityEntries) {
      const summary = days.get(entry.dayOfWeek) ?? {
        sessionCount: 0,
        totalHours: 0,
        hasConflict: false,
        gapCount: 0,
      };
      summary.sessionCount += 1;
      summary.totalHours +=
        (parseTimeToMinutes(entry.endTime) -
          parseTimeToMinutes(entry.startTime)) /
        60;
      summary.hasConflict = summary.hasConflict || conflictIds.has(entry.id);
      days.set(entry.dayOfWeek, summary);
    }
    for (const gap of gaps) {
      const summary = days.get(gap.dayOfWeek);
      if (summary) {
        summary.gapCount += 1;
      }
    }
    result.set(entityId, days);
  }
  return result;
}
