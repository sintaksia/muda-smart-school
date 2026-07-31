/**
 * Column headers for the student import template, the import parser and the
 * student export. Single source of truth so template, upload and download can
 * never drift apart.
 */
export const STUDENT_SHEET_COLUMNS = {
  name: "Nama Lengkap",
  email: "Email",
  nis: "NIS",
  nisn: "NISN",
  specialization: "Program Keahlian",
  angkatan: "Angkatan",
  className: "Kelas",
  gender: "Jenis Kelamin",
  nik: "NIK",
  birthPlace: "Tempat Lahir",
  birthDate: "Tanggal Lahir",
  phone: "No. HP",
  streetAddress: "Alamat",
  village: "Kelurahan/Desa",
  district: "Kecamatan",
  city: "Kota/Kabupaten",
  province: "Provinsi",
  fatherName: "Nama Ayah",
  motherName: "Nama Ibu",
  guardianName: "Nama Wali",
  parentPhone: "No. HP Orang Tua",
  previousSchoolName: "Sekolah Asal",
} as const;

export type StudentSheetField = keyof typeof STUDENT_SHEET_COLUMNS;

/** Extra column present on export only — status is never imported. */
export const STUDENT_EXPORT_STATUS_COLUMN = "Status";

/** Columns an import row cannot be created without. */
export const STUDENT_SHEET_REQUIRED_FIELDS: StudentSheetField[] = [
  "name",
  "email",
  "nis",
  "nisn",
  "specialization",
  "angkatan",
];
