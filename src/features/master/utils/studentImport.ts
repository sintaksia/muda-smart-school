import { genderOptions, specializationOptions } from "@/src/lib/constants";
import {
  STUDENT_SHEET_COLUMNS,
  STUDENT_SHEET_REQUIRED_FIELDS,
  type StudentSheetField,
} from "../constants";

/** A raw row as produced by `XLSX.utils.sheet_to_json` (header -> cell). */
export type StudentSheetRow = Record<string, unknown>;

/** A sheet row after header mapping and label -> enum resolution. */
export interface NormalizedStudentRow {
  name: string;
  email: string;
  nis: string;
  nisn: string;
  specialization: string;
  angkatan: number;
  className: string;
  gender: string | null;
  nik: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  phone: string | null;
  streetAddress: string | null;
  village: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  fatherName: string | null;
  motherName: string | null;
  guardianName: string | null;
  parentPhone: string | null;
  previousSchoolName: string | null;
}

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function optionalText(value: unknown): string | null {
  return text(value) || null;
}

function cell(row: StudentSheetRow, field: StudentSheetField): unknown {
  return row[STUDENT_SHEET_COLUMNS[field]];
}

/** Accepts the enum value, the short code (PPLG) or the full Indonesian label. */
export function resolveSpecialization(value: unknown): string | null {
  const input = text(value).toUpperCase();
  if (!input) return null;
  const match = specializationOptions.find(
    (option) =>
      option.value === input ||
      option.short.toUpperCase() === input ||
      option.label.toUpperCase() === input,
  );
  return match?.value ?? null;
}

/** Accepts MALE/FEMALE, "Laki-laki"/"Perempuan", or L/P. */
export function resolveGender(value: unknown): string | null {
  const input = text(value).toUpperCase();
  if (!input) return null;
  if (input === "L") return "MALE";
  if (input === "P") return "FEMALE";
  const match = genderOptions.find(
    (option) =>
      option.value === input ||
      option.label.toUpperCase() === input.replace(/\s/g, "-"),
  );
  return match?.value ?? null;
}

/** Normalises YYYY-MM-DD, DD/MM/YYYY and Date cells to YYYY-MM-DD. */
export function resolveDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const input = text(value);
  if (!input) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const slashed = input.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashed) {
    const [, day, month, year] = slashed;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return null;
}

/**
 * Map one spreadsheet row onto the import shape, reporting the first problem
 * that makes the row unusable. Class name -> id resolution happens in the
 * service, which is the only layer that knows the class list.
 */
export function normalizeStudentRow(raw: StudentSheetRow): {
  data: NormalizedStudentRow;
  error: string | null;
} {
  const specialization = resolveSpecialization(cell(raw, "specialization"));
  const angkatan = Number.parseInt(text(cell(raw, "angkatan")), 10);
  const birthDateCell = cell(raw, "birthDate");

  const data: NormalizedStudentRow = {
    name: text(cell(raw, "name")),
    email: text(cell(raw, "email")).toLowerCase(),
    nis: text(cell(raw, "nis")),
    nisn: text(cell(raw, "nisn")),
    specialization: specialization ?? "",
    angkatan: Number.isNaN(angkatan) ? 0 : angkatan,
    className: text(cell(raw, "className")),
    gender: resolveGender(cell(raw, "gender")),
    nik: optionalText(cell(raw, "nik")),
    birthPlace: optionalText(cell(raw, "birthPlace")),
    birthDate: resolveDate(birthDateCell),
    phone: optionalText(cell(raw, "phone")),
    streetAddress: optionalText(cell(raw, "streetAddress")),
    village: optionalText(cell(raw, "village")),
    district: optionalText(cell(raw, "district")),
    city: optionalText(cell(raw, "city")),
    province: optionalText(cell(raw, "province")),
    fatherName: optionalText(cell(raw, "fatherName")),
    motherName: optionalText(cell(raw, "motherName")),
    guardianName: optionalText(cell(raw, "guardianName")),
    parentPhone: optionalText(cell(raw, "parentPhone")),
    previousSchoolName: optionalText(cell(raw, "previousSchoolName")),
  };

  const missing = STUDENT_SHEET_REQUIRED_FIELDS.filter((field) =>
    field === "angkatan" ? !data.angkatan : !text(cell(raw, field)),
  );
  if (missing.length > 0) {
    const labels = missing.map((field) => STUDENT_SHEET_COLUMNS[field]);
    return { data, error: `Kolom wajib kosong: ${labels.join(", ")}` };
  }
  if (!specialization) {
    const known = specializationOptions.map((o) => o.short).join(", ");
    return {
      data,
      error: `Program keahlian tidak dikenali. Gunakan: ${known}`,
    };
  }
  if (text(birthDateCell) && !data.birthDate) {
    return { data, error: "Tanggal lahir tidak valid (format: YYYY-MM-DD)" };
  }
  return { data, error: null };
}
