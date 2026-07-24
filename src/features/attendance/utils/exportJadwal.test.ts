import { describe, expect, it, vi } from "vitest";
import {
  buildFlatRows,
  buildClassMatrix,
  exportJadwalToExcel,
  sanitizeSheetName,
} from "./exportJadwal";
import type { JadwalEntry } from "./jadwalGrid";

vi.mock("xlsx", () => ({
  utils: {
    book_new: vi.fn(() => ({ SheetNames: [] })),
    aoa_to_sheet: vi.fn((rows: string[][]) => ({ rows })),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

function entry(overrides: Partial<JadwalEntry> & { id: string }): JadwalEntry {
  return {
    dayOfWeek: "MONDAY",
    startTime: "07:00",
    endTime: "08:30",
    classId: "k1",
    className: "X-A",
    teacherId: "g1",
    teacherName: "Budi",
    subjectName: "Matematika",
    ...overrides,
  };
}

describe("buildFlatRows", () => {
  it("sorts by day then start time with a header row", () => {
    const rows = buildFlatRows([
      entry({ id: "a", dayOfWeek: "TUESDAY" }),
      entry({ id: "b", startTime: "09:00", endTime: "10:00" }),
      entry({ id: "c" }),
    ]);
    expect(rows[0]).toEqual([
      "Hari",
      "Jam Mulai",
      "Jam Selesai",
      "Kelas",
      "Mata Pelajaran",
      "Guru",
    ]);
    expect(rows.map((row) => [row[0], row[1]])).toEqual([
      ["Hari", "Jam Mulai"],
      ["Senin", "07:00"],
      ["Senin", "09:00"],
      ["Selasa", "07:00"],
    ]);
  });

  it("returns only the header for no entries", () => {
    expect(buildFlatRows([])).toHaveLength(1);
  });
});

describe("buildClassMatrix", () => {
  it("pivots time ranges into day columns", () => {
    const rows = buildClassMatrix([
      entry({ id: "a" }),
      entry({
        id: "b",
        dayOfWeek: "TUESDAY",
        startTime: "09:00",
        endTime: "10:00",
        subjectName: "Fisika",
        teacherName: "Sari",
      }),
    ]);
    expect(rows[0]).toEqual([
      "Jam",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ]);
    expect(rows[1][0]).toBe("07:00–08:30");
    expect(rows[1][1]).toBe("Matematika — Budi");
    expect(rows[1][2]).toBe("");
    expect(rows[2][2]).toBe("Fisika — Sari");
  });
});

describe("sanitizeSheetName", () => {
  it("strips invalid characters and truncates to 31 chars", () => {
    expect(sanitizeSheetName("X-A [IPA] / 2026")).toBe("X-A  IPA    2026");
    expect(sanitizeSheetName("a".repeat(40))).toHaveLength(31);
    expect(sanitizeSheetName("[]")).toBe("Sheet");
  });
});

describe("exportJadwalToExcel", () => {
  it("writes a flat sheet plus one sheet per class", async () => {
    const xlsx = await import("xlsx");
    exportJadwalToExcel([
      entry({ id: "a" }),
      entry({ id: "b", classId: "k2", className: "X-B" }),
    ]);
    const appendCalls = vi.mocked(xlsx.utils.book_append_sheet).mock.calls;
    expect(appendCalls.map((call) => call[2])).toEqual([
      "Semua Jadwal",
      "X-A",
      "X-B",
    ]);
    expect(xlsx.writeFile).toHaveBeenCalledWith(
      expect.anything(),
      "jadwal-pelajaran.xlsx",
    );
  });
});
