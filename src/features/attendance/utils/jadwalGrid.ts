import { parseTimeToMinutes, timeRangesOverlap } from "./time";

/** A denormalized schedule row as rendered by the admin timetable UI. */
export interface JadwalEntry {
  id: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  kelasId: string;
  kelas: string;
  guruId: string;
  guru: string;
  mataPelajaran: string;
}

/** An empty interval between two sessions of the same entity on one day. */
export interface JadwalGap {
  hari: string;
  jamMulai: string;
  jamSelesai: string;
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
    boundaries.add(entry.jamMulai);
    boundaries.add(entry.jamSelesai);
  }
  return Array.from(boundaries).sort(
    (a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b),
  );
}

/**
 * Ids of entries that clash: same guru or same kelas, same day, overlapping
 * time ranges. Mirrors the server-side validation in services/schedule.ts.
 */
export function findConflictIds(entries: JadwalEntry[]): Set<string> {
  const conflictIds = new Set<string>();
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      if (a.hari !== b.hari) continue;
      if (a.guruId !== b.guruId && a.kelasId !== b.kelasId) continue;
      if (
        timeRangesOverlap(a.jamMulai, a.jamSelesai, b.jamMulai, b.jamSelesai)
      ) {
        conflictIds.add(a.id);
        conflictIds.add(b.id);
      }
    }
  }
  return conflictIds;
}

/**
 * Empty intervals between the first and last session of each day for one
 * entity's entries (pass entries already filtered to a kelas or guru).
 */
export function findGaps(entries: JadwalEntry[]): JadwalGap[] {
  const byDay = new Map<string, JadwalEntry[]>();
  for (const entry of entries) {
    const list = byDay.get(entry.hari) ?? [];
    list.push(entry);
    byDay.set(entry.hari, list);
  }

  const gaps: JadwalGap[] = [];
  for (const [hari, dayEntries] of byDay) {
    const sorted = [...dayEntries].sort(
      (a, b) => parseTimeToMinutes(a.jamMulai) - parseTimeToMinutes(b.jamMulai),
    );
    let coveredUntil = parseTimeToMinutes(sorted[0].jamMulai);
    let coveredUntilLabel = sorted[0].jamMulai;
    for (const entry of sorted) {
      const start = parseTimeToMinutes(entry.jamMulai);
      if (start > coveredUntil) {
        gaps.push({
          hari,
          jamMulai: coveredUntilLabel,
          jamSelesai: entry.jamMulai,
        });
      }
      const end = parseTimeToMinutes(entry.jamSelesai);
      if (end > coveredUntil) {
        coveredUntil = end;
        coveredUntilLabel = entry.jamSelesai;
      }
    }
  }
  return gaps;
}

/**
 * Heatmap rollup: for each entity (keyed by kelasId or guruId) and day,
 * session count, total hours, conflict flag, and gap count. Gaps are only
 * meaningful for kelas (a class should have no idle time between sessions).
 */
export function summarizeByEntity(
  entries: JadwalEntry[],
  entityKey: "kelasId" | "guruId",
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
      const summary = days.get(entry.hari) ?? {
        sessionCount: 0,
        totalHours: 0,
        hasConflict: false,
        gapCount: 0,
      };
      summary.sessionCount += 1;
      summary.totalHours +=
        (parseTimeToMinutes(entry.jamSelesai) -
          parseTimeToMinutes(entry.jamMulai)) /
        60;
      summary.hasConflict = summary.hasConflict || conflictIds.has(entry.id);
      days.set(entry.hari, summary);
    }
    for (const gap of gaps) {
      const summary = days.get(gap.hari);
      if (summary) {
        summary.gapCount += 1;
      }
    }
    result.set(entityId, days);
  }
  return result;
}
