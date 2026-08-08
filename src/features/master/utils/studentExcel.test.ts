import { describe, expect, it, vi } from "vitest";
import {
  buildStudentExportRows,
  buildStudentTemplateRows,
  downloadStudentExport,
} from "./studentExcel";
import { STUDENT_SHEET_COLUMNS } from "../constants";
import type { StudentRow } from "../types";

vi.mock("xlsx", () => ({
  utils: {
    book_new: vi.fn(() => ({ SheetNames: [] })),
    json_to_sheet: vi.fn((rows: unknown[]) => ({ rows })),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

function student(overrides: Partial<StudentRow> = {}): StudentRow {
  return {
    id: "s1",
    userId: "u1",
    classId: "k1",
    name: "Budi Santoso",
    avatar: null,
    email: "budi@contoh.sch.id",
    nis: "2024001",
    nisn: "0091234567",
    specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
    angkatan: 2024,
    className: "X PPLG 1",
    status: "AKTIF",
    gender: "MALE",
    nik: null,
    birthPlace: null,
    birthDate: null,
    phone: null,
    streetAddress: null,
    village: null,
    district: null,
    city: null,
    province: null,
    fatherName: null,
    motherName: null,
    guardianName: null,
    parentPhone: null,
    previousSchoolName: null,
    ...overrides,
  };
}

describe("buildStudentExportRows", () => {
  it("writes human-readable labels under the shared headers", () => {
    const [row] = buildStudentExportRows([student()]);

    expect(row[STUDENT_SHEET_COLUMNS.name]).toBe("Budi Santoso");
    expect(row[STUDENT_SHEET_COLUMNS.specialization]).toBe("PPLG");
    expect(row[STUDENT_SHEET_COLUMNS.gender]).toBe("Laki-laki");
    expect(row["Status"]).toBe("Aktif");
  });

  it("renders missing optional data as an empty cell, never 'null'", () => {
    const [row] = buildStudentExportRows([
      student({ className: null, gender: null, nik: null }),
    ]);

    expect(row[STUDENT_SHEET_COLUMNS.className]).toBe("");
    expect(row[STUDENT_SHEET_COLUMNS.gender]).toBe("");
    expect(row[STUDENT_SHEET_COLUMNS.nik]).toBe("");
  });
});

describe("buildStudentTemplateRows", () => {
  it("covers every import column so no header is missing from the template", () => {
    const [row] = buildStudentTemplateRows();

    for (const header of Object.values(STUDENT_SHEET_COLUMNS)) {
      expect(row).toHaveProperty(header);
    }
  });
});

describe("downloadStudentExport", () => {
  it("writes a dated workbook", async () => {
    downloadStudentExport([student()]);

    const xlsx = await import("xlsx");
    expect(xlsx.writeFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/^siswa-\d{4}-\d{2}-\d{2}\.xlsx$/),
    );
  });
});
