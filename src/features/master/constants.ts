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

/**
 * Academic-year master setting, stored as a SchoolSetting row (group
 * "academic"). Kept here rather than in a feature service so prisma/seed.ts can
 * import it by relative path, the same arrangement the attendance rules use.
 *
 * The seed value is intentionally empty: the real fallback is computed from
 * today's date (see services/academicYear.ts), so a fresh install is never
 * pinned to whichever year the seed happened to be written in.
 */
export const ACADEMIC_SETTINGS_GROUP = "academic";

export const ACTIVE_ACADEMIC_YEAR_KEY = "ACTIVE_ACADEMIC_YEAR";

export const ACADEMIC_SETTING_DEFINITIONS = [
  {
    key: ACTIVE_ACADEMIC_YEAR_KEY,
    value: "",
    label: "Tahun Ajaran Aktif",
    type: "TEXT" as const,
  },
];

/** Month (1–12) a new academic year starts in. July, per the national calendar. */
export const ACADEMIC_YEAR_START_MONTH = 7;
