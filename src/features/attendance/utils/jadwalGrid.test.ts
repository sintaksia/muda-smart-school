import { describe, expect, it } from "vitest";
import {
  buildTimeBoundaries,
  findConflictIds,
  findGaps,
  summarizeByEntity,
  type JadwalEntry,
} from "./jadwalGrid";

function entry(overrides: Partial<JadwalEntry> & { id: string }): JadwalEntry {
  return {
    dayOfWeek: "MONDAY",
    startTime: "07:00",
    endTime: "08:30",
    classId: "k1",
    kelas: "X-A",
    teacherId: "g1",
    guru: "Budi",
    mataPelajaran: "Matematika",
    ...overrides,
  };
}

describe("buildTimeBoundaries", () => {
  it("returns sorted unique boundaries", () => {
    const boundaries = buildTimeBoundaries([
      entry({ id: "a", startTime: "08:30", endTime: "10:00" }),
      entry({ id: "b", startTime: "07:00", endTime: "08:30" }),
    ]);
    expect(boundaries).toEqual(["07:00", "08:30", "10:00"]);
  });

  it("returns empty array for no entries", () => {
    expect(buildTimeBoundaries([])).toEqual([]);
  });
});

describe("findConflictIds", () => {
  it("flags same-guru overlap on the same day", () => {
    const conflicts = findConflictIds([
      entry({ id: "a", classId: "k1" }),
      entry({ id: "b", classId: "k2", startTime: "08:00", endTime: "09:00" }),
    ]);
    expect(conflicts).toEqual(new Set(["a", "b"]));
  });

  it("flags same-kelas overlap with different guru", () => {
    const conflicts = findConflictIds([
      entry({ id: "a", teacherId: "g1" }),
      entry({ id: "b", teacherId: "g2", startTime: "07:30", endTime: "08:00" }),
    ]);
    expect(conflicts).toEqual(new Set(["a", "b"]));
  });

  it("ignores overlap on different days or adjacent ranges", () => {
    const conflicts = findConflictIds([
      entry({ id: "a" }),
      entry({ id: "b", dayOfWeek: "TUESDAY" }),
      entry({ id: "c", startTime: "08:30", endTime: "10:00" }),
    ]);
    expect(conflicts.size).toBe(0);
  });
});

describe("findGaps", () => {
  it("detects an empty interval between sessions", () => {
    const gaps = findGaps([
      entry({ id: "a", startTime: "07:00", endTime: "08:30" }),
      entry({ id: "b", startTime: "09:00", endTime: "10:00" }),
    ]);
    expect(gaps).toEqual([
      { dayOfWeek: "MONDAY", startTime: "08:30", endTime: "09:00" },
    ]);
  });

  it("reports no gap for back-to-back or overlapping sessions", () => {
    const gaps = findGaps([
      entry({ id: "a", startTime: "07:00", endTime: "08:30" }),
      entry({ id: "b", startTime: "08:30", endTime: "10:00" }),
      entry({ id: "c", startTime: "09:00", endTime: "09:30" }),
    ]);
    expect(gaps).toEqual([]);
  });
});

describe("summarizeByEntity", () => {
  it("rolls up sessions, hours, conflicts, and gaps per kelas per day", () => {
    const summary = summarizeByEntity(
      [
        entry({ id: "a", startTime: "07:00", endTime: "08:30" }),
        entry({
          id: "b",
          startTime: "09:00",
          endTime: "10:00",
          teacherId: "g2",
        }),
      ],
      "classId",
    );
    const senin = summary.get("k1")?.get("MONDAY");
    expect(senin).toEqual({
      sessionCount: 2,
      totalHours: 2.5,
      hasConflict: false,
      gapCount: 1,
    });
  });

  it("marks conflicts in the rollup", () => {
    const summary = summarizeByEntity(
      [
        entry({ id: "a" }),
        entry({
          id: "b",
          startTime: "07:30",
          endTime: "08:00",
          teacherId: "g2",
        }),
      ],
      "classId",
    );
    expect(summary.get("k1")?.get("MONDAY")?.hasConflict).toBe(true);
  });
});
