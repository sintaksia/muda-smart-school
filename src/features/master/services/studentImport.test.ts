import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createStudent } from "./student";
import { importStudents } from "./studentImport";
import { STUDENT_SHEET_COLUMNS } from "../constants";
import type { SchoolClass, Student } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: { schoolClass: { findMany: vi.fn() } },
}));

vi.mock("./student", () => ({ createStudent: vi.fn() }));

function sheetRow(overrides: Record<string, unknown> = {}) {
  return {
    [STUDENT_SHEET_COLUMNS.name]: "Budi Santoso",
    [STUDENT_SHEET_COLUMNS.email]: "budi@contoh.sch.id",
    [STUDENT_SHEET_COLUMNS.nis]: "2024001",
    [STUDENT_SHEET_COLUMNS.nisn]: "0091234567",
    [STUDENT_SHEET_COLUMNS.specialization]: "PPLG",
    [STUDENT_SHEET_COLUMNS.angkatan]: 2024,
    [STUDENT_SHEET_COLUMNS.className]: "X PPLG 1",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.schoolClass.findMany).mockResolvedValue([
    { id: "k1", name: "X PPLG 1" } as SchoolClass,
  ]);
  vi.mocked(createStudent).mockResolvedValue({
    student: { id: "s1" } as Student,
    error: null,
  });
});

describe("importStudents", () => {
  it("creates each row and returns the generated credentials", async () => {
    const result = await importStudents([sheetRow()], "admin1");

    expect(result.created).toBe(1);
    expect(result.failures).toHaveLength(0);
    expect(result.credentials[0]).toEqual({
      name: "Budi Santoso",
      nis: "2024001",
      email: "budi@contoh.sch.id",
      password: "Siswa2024001",
    });
    expect(vi.mocked(createStudent).mock.calls[0][0]).toMatchObject({
      classId: "k1",
      specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
    });
  });

  it("skips a bad row, reports its sheet number, and keeps importing the rest", async () => {
    const result = await importStudents([
      sheetRow({ [STUDENT_SHEET_COLUMNS.email]: "" }),
      sheetRow({ [STUDENT_SHEET_COLUMNS.nis]: "2024002" }),
    ]);

    expect(result.created).toBe(1);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].row).toBe(2);
    expect(result.failures[0].error).toContain(STUDENT_SHEET_COLUMNS.email);
  });

  it("reports an unknown class instead of creating the student", async () => {
    const result = await importStudents([
      sheetRow({ [STUDENT_SHEET_COLUMNS.className]: "XII RPL 9" }),
    ]);

    expect(result.created).toBe(0);
    expect(result.failures[0].error).toContain("XII RPL 9");
    expect(createStudent).not.toHaveBeenCalled();
  });

  it("surfaces a create failure as a row failure", async () => {
    vi.mocked(createStudent).mockResolvedValue({
      student: null,
      error: "NIS sudah digunakan siswa lain",
    });

    const result = await importStudents([sheetRow()]);

    expect(result.created).toBe(0);
    expect(result.failures[0].error).toBe("NIS sudah digunakan siswa lain");
  });
});
