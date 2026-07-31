import { utils, writeFile } from "xlsx";
import {
  GENDER_LABELS,
  SPECIALIZATION_LABELS,
  SPECIALIZATION_SHORT_LABELS,
  STUDENT_STATUS_LABELS,
} from "@/src/lib/constants";
import {
  STUDENT_EXPORT_STATUS_COLUMN,
  STUDENT_SHEET_COLUMNS,
} from "../constants";
import type { StudentRow } from "../types";

const EMPTY = "";

export function buildStudentExportRows(
  students: StudentRow[],
): Record<string, string | number>[] {
  return students.map((student) => ({
    [STUDENT_SHEET_COLUMNS.name]: student.name,
    [STUDENT_SHEET_COLUMNS.email]: student.email,
    [STUDENT_SHEET_COLUMNS.nis]: student.nis,
    [STUDENT_SHEET_COLUMNS.nisn]: student.nisn,
    [STUDENT_SHEET_COLUMNS.specialization]:
      SPECIALIZATION_SHORT_LABELS[student.specialization] ??
      student.specialization,
    [STUDENT_SHEET_COLUMNS.angkatan]: student.angkatan,
    [STUDENT_SHEET_COLUMNS.className]: student.className ?? EMPTY,
    [STUDENT_EXPORT_STATUS_COLUMN]:
      STUDENT_STATUS_LABELS[student.status] ?? student.status,
    [STUDENT_SHEET_COLUMNS.gender]: student.gender
      ? (GENDER_LABELS[student.gender] ?? student.gender)
      : EMPTY,
    [STUDENT_SHEET_COLUMNS.nik]: student.nik ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.birthPlace]: student.birthPlace ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.birthDate]: student.birthDate ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.phone]: student.phone ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.streetAddress]: student.streetAddress ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.village]: student.village ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.district]: student.district ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.city]: student.city ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.province]: student.province ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.fatherName]: student.fatherName ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.motherName]: student.motherName ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.guardianName]: student.guardianName ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.parentPhone]: student.parentPhone ?? EMPTY,
    [STUDENT_SHEET_COLUMNS.previousSchoolName]:
      student.previousSchoolName ?? EMPTY,
  }));
}

/** One filled-in example row so the admin can see the expected formats. */
export function buildStudentTemplateRows(): Record<string, string | number>[] {
  const [firstSpecialization] = Object.keys(SPECIALIZATION_LABELS);
  return [
    {
      [STUDENT_SHEET_COLUMNS.name]: "Budi Santoso",
      [STUDENT_SHEET_COLUMNS.email]: "budi.santoso@contoh.sch.id",
      [STUDENT_SHEET_COLUMNS.nis]: "2024001",
      [STUDENT_SHEET_COLUMNS.nisn]: "0091234567",
      [STUDENT_SHEET_COLUMNS.specialization]:
        SPECIALIZATION_SHORT_LABELS[firstSpecialization],
      [STUDENT_SHEET_COLUMNS.angkatan]: new Date().getFullYear(),
      [STUDENT_SHEET_COLUMNS.className]: "X TO 1",
      [STUDENT_SHEET_COLUMNS.gender]: GENDER_LABELS.MALE,
      [STUDENT_SHEET_COLUMNS.nik]: "3210010101090001",
      [STUDENT_SHEET_COLUMNS.birthPlace]: "Bandung",
      [STUDENT_SHEET_COLUMNS.birthDate]: "2009-05-01",
      [STUDENT_SHEET_COLUMNS.phone]: "081234567890",
      [STUDENT_SHEET_COLUMNS.streetAddress]: "Jl. Merdeka No. 10",
      [STUDENT_SHEET_COLUMNS.village]: "Sukamaju",
      [STUDENT_SHEET_COLUMNS.district]: "Cibeunying",
      [STUDENT_SHEET_COLUMNS.city]: "Bandung",
      [STUDENT_SHEET_COLUMNS.province]: "Jawa Barat",
      [STUDENT_SHEET_COLUMNS.fatherName]: "Ahmad Santoso",
      [STUDENT_SHEET_COLUMNS.motherName]: "Siti Aminah",
      [STUDENT_SHEET_COLUMNS.guardianName]: EMPTY,
      [STUDENT_SHEET_COLUMNS.parentPhone]: "081298765432",
      [STUDENT_SHEET_COLUMNS.previousSchoolName]: "SMPN 1 Bandung",
    },
  ];
}

function download(
  rows: Record<string, string | number>[],
  sheetName: string,
  filename: string,
): void {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.json_to_sheet(rows), sheetName);
  writeFile(workbook, filename);
}

/** Download the blank-ish import template (headers + one example row). */
export function downloadStudentTemplate(): void {
  download(buildStudentTemplateRows(), "Template Siswa", "template-siswa.xlsx");
}

/** Download the currently visible students as .xlsx. */
export function downloadStudentExport(students: StudentRow[]): void {
  const date = new Date().toISOString().slice(0, 10);
  download(buildStudentExportRows(students), "Siswa", `siswa-${date}.xlsx`);
}
