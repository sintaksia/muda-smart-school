import { describe, it, expect } from "vitest";
import {
  normalizeStudentRow,
  resolveDate,
  resolveGender,
  resolveSpecialization,
} from "./studentImport";
import { STUDENT_SHEET_COLUMNS } from "../constants";

function sheetRow(overrides: Record<string, unknown> = {}) {
  return {
    [STUDENT_SHEET_COLUMNS.name]: "Budi Santoso",
    [STUDENT_SHEET_COLUMNS.email]: "Budi@Sekolah.sch.id",
    [STUDENT_SHEET_COLUMNS.nis]: "2024001",
    [STUDENT_SHEET_COLUMNS.nisn]: "0091234567",
    [STUDENT_SHEET_COLUMNS.specialization]: "PPLG",
    [STUDENT_SHEET_COLUMNS.angkatan]: "2024",
    [STUDENT_SHEET_COLUMNS.className]: "X PPLG 1",
    [STUDENT_SHEET_COLUMNS.gender]: "Laki-laki",
    [STUDENT_SHEET_COLUMNS.birthDate]: "01/05/2009",
    ...overrides,
  };
}

describe("resolveSpecialization", () => {
  it("accepts enum value, short code and full label", () => {
    expect(resolveSpecialization("SOFTWARE_AND_GAME_DEVELOPMENT")).toBe(
      "SOFTWARE_AND_GAME_DEVELOPMENT",
    );
    expect(resolveSpecialization("pplg")).toBe("SOFTWARE_AND_GAME_DEVELOPMENT");
    expect(resolveSpecialization("Teknik Otomotif")).toBe(
      "AUTOMOTIVE_ENGINEERING",
    );
  });

  it("returns null for an unknown or empty value", () => {
    expect(resolveSpecialization("TATA BOGA")).toBeNull();
    expect(resolveSpecialization("")).toBeNull();
  });
});

describe("resolveGender", () => {
  it("accepts value, label and single-letter shorthand", () => {
    expect(resolveGender("FEMALE")).toBe("FEMALE");
    expect(resolveGender("Laki laki")).toBe("MALE");
    expect(resolveGender("P")).toBe("FEMALE");
  });

  it("returns null when unrecognised", () => {
    expect(resolveGender("x")).toBeNull();
  });
});

describe("resolveDate", () => {
  it("normalises supported formats to YYYY-MM-DD", () => {
    expect(resolveDate("2009-05-01")).toBe("2009-05-01");
    expect(resolveDate("1/5/2009")).toBe("2009-05-01");
    expect(resolveDate(new Date("2009-05-01T00:00:00.000Z"))).toBe(
      "2009-05-01",
    );
  });

  it("returns null for empty or malformed input", () => {
    expect(resolveDate("")).toBeNull();
    expect(resolveDate("kemarin")).toBeNull();
  });
});

describe("normalizeStudentRow", () => {
  it("maps a complete row and lower-cases the email", () => {
    const { data, error } = normalizeStudentRow(sheetRow());

    expect(error).toBeNull();
    expect(data.email).toBe("budi@sekolah.sch.id");
    expect(data.specialization).toBe("SOFTWARE_AND_GAME_DEVELOPMENT");
    expect(data.angkatan).toBe(2024);
    expect(data.gender).toBe("MALE");
    expect(data.birthDate).toBe("2009-05-01");
    expect(data.className).toBe("X PPLG 1");
    expect(data.nik).toBeNull();
  });

  it("reports every missing required column at once", () => {
    const { error } = normalizeStudentRow(
      sheetRow({
        [STUDENT_SHEET_COLUMNS.nis]: "",
        [STUDENT_SHEET_COLUMNS.angkatan]: "",
      }),
    );

    expect(error).toContain(STUDENT_SHEET_COLUMNS.nis);
    expect(error).toContain(STUDENT_SHEET_COLUMNS.angkatan);
  });

  it("rejects an unknown specialization and an invalid birth date", () => {
    expect(
      normalizeStudentRow(
        sheetRow({ [STUDENT_SHEET_COLUMNS.specialization]: "TATA BOGA" }),
      ).error,
    ).toContain("Program keahlian");

    expect(
      normalizeStudentRow(
        sheetRow({ [STUDENT_SHEET_COLUMNS.birthDate]: "kemarin" }),
      ).error,
    ).toContain("Tanggal lahir");
  });
});
