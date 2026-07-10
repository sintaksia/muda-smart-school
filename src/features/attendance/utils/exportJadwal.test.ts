import { describe, expect, it, vi } from "vitest";
import {
  buildFlatRows,
  buildKelasMatrix,
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
    hari: "SENIN",
    jamMulai: "07:00",
    jamSelesai: "08:30",
    kelasId: "k1",
    kelas: "X-A",
    guruId: "g1",
    guru: "Budi",
    mataPelajaran: "Matematika",
    ...overrides,
  };
}

describe("buildFlatRows", () => {
  it("sorts by day then start time with a header row", () => {
    const rows = buildFlatRows([
      entry({ id: "a", hari: "SELASA" }),
      entry({ id: "b", jamMulai: "09:00", jamSelesai: "10:00" }),
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

describe("buildKelasMatrix", () => {
  it("pivots time ranges into day columns", () => {
    const rows = buildKelasMatrix([
      entry({ id: "a" }),
      entry({
        id: "b",
        hari: "SELASA",
        jamMulai: "09:00",
        jamSelesai: "10:00",
        mataPelajaran: "Fisika",
        guru: "Sari",
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
  it("writes a flat sheet plus one sheet per kelas", async () => {
    const xlsx = await import("xlsx");
    exportJadwalToExcel([
      entry({ id: "a" }),
      entry({ id: "b", kelasId: "k2", kelas: "X-B" }),
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
