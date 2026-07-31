import { ROLE_LABELS } from "@/src/features/auth/types";

/**
 * App version, sourced from package.json via next.config `env`.
 * Import this instead of hardcoding a version string anywhere in the UI.
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "";

/**
 * Single source of truth for the Indonesian display noun of each core
 * domain entity. Import this instead of hardcoding "Siswa"/"Guru"/"Kelas"/
 * "Mata Pelajaran" — changing a noun here updates every consumer at once.
 */
export const ENTITY_LABELS = {
  STUDENT: ROLE_LABELS.STUDENT,
  TEACHER: ROLE_LABELS.TEACHER,
  CLASS: "Kelas",
  SUBJECT: "Mata Pelajaran",
} as const;

export const genderOptions = [
  { value: "MALE", label: "Laki-laki" },
  { value: "FEMALE", label: "Perempuan" },
] as const;

export const GENDER_VALUES = genderOptions.map((option) => option.value);

export const GENDER_LABELS: Record<string, string> = Object.fromEntries(
  genderOptions.map((option) => [option.value, option.label]),
);

export const specializationOptions = [
  {
    value: "AUTOMOTIVE_ENGINEERING",
    label: "Teknik Otomotif",
    short: "TO",
    color: "#EF4444",
  },
  {
    value: "SOFTWARE_AND_GAME_DEVELOPMENT",
    label: "Pemrograman Perangkat Lunak dan Gim",
    short: "PPLG",
    color: "#32368C",
  },
  {
    value: "NETWORK_AND_TELECOMMUNICATIONS_ENGINEERING",
    label: "Teknik Jaringan Komputer dan Telekomunikasi",
    short: "TJKT",
    color: "#4CAF93",
  },
  {
    value: "OFFICE_MANAGEMENT_AND_BUSINESS_SERVICES",
    label: "Manajemen Perkantoran dan Layanan Bisnis",
    short: "MPLB",
    color: "#F2C94C",
  },
  {
    value: "ACCOUNTING_AND_INSTITUTIONAL_FINANCE",
    label: "Akuntansi dan Keuangan Lembaga",
    short: "AKL",
    color: "#9333EA",
  },
] as const;

export const SPECIALIZATION_VALUES = specializationOptions.map(
  (option) => option.value,
);

export const SPECIALIZATION_LABELS: Record<string, string> = Object.fromEntries(
  specializationOptions.map((option) => [option.value, option.label]),
);

export const SPECIALIZATION_SHORT_LABELS: Record<string, string> =
  Object.fromEntries(
    specializationOptions.map((option) => [option.value, option.short]),
  );

export const SPECIALIZATION_COLORS: Record<string, string> = Object.fromEntries(
  specializationOptions.map((option) => [option.value, option.color]),
);

export const educationOptions = [
  { value: "NO_SCHOOLING", label: "Tidak Sekolah" },
  { value: "SD", label: "SD/Sederajat" },
  { value: "SMP", label: "SMP/Sederajat" },
  { value: "SMA", label: "SMA/Sederajat" },
  { value: "SMK", label: "SMK" },
  { value: "D1", label: "D1" },
  { value: "D2", label: "D2" },
  { value: "D3", label: "D3" },
  { value: "D4", label: "D4" },
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
] as const;

export const EDUCATION_LABELS: Record<string, string> = Object.fromEntries(
  educationOptions.map((option) => [option.value, option.label]),
);

export const registrationStatusOptions = [
  { value: "PENDING", label: "Menunggu", badge: "warning" as const },
  { value: "VERIFIED", label: "Terverifikasi", badge: "info" as const },
  { value: "ACCEPTED", label: "Diterima", badge: "success" as const },
  { value: "REJECTED", label: "Ditolak", badge: "destructive" as const },
] as const;

export const REGISTRATION_STATUS_VALUES = registrationStatusOptions.map(
  (option) => option.value,
);

export const REGISTRATION_STATUS_LABELS: Record<string, string> =
  Object.fromEntries(
    registrationStatusOptions.map((option) => [option.value, option.label]),
  );

export const REGISTRATION_STATUS_BADGES: Record<
  string,
  "success" | "warning" | "info" | "destructive"
> = Object.fromEntries(
  registrationStatusOptions.map((option) => [option.value, option.badge]),
);

/* ============================================================
 * Attendance & Credit Score system
 * ============================================================ */

export const attendanceStatusOptions = [
  { value: "PRESENT", label: "Hadir", badge: "success" as const },
  { value: "LATE", label: "Terlambat", badge: "warning" as const },
  { value: "EXCUSED", label: "Izin", badge: "info" as const },
  { value: "SICK", label: "Sakit", badge: "secondary" as const },
  { value: "ABSENT", label: "Alpa", badge: "destructive" as const },
] as const;

export const ATTENDANCE_STATUS_VALUES = attendanceStatusOptions.map(
  (o) => o.value,
);

export const ATTENDANCE_STATUS_LABELS: Record<string, string> =
  Object.fromEntries(attendanceStatusOptions.map((o) => [o.value, o.label]));

export const ATTENDANCE_STATUS_BADGES: Record<
  string,
  "success" | "warning" | "info" | "secondary" | "destructive"
> = Object.fromEntries(attendanceStatusOptions.map((o) => [o.value, o.badge]));

export const sessionStatusOptions = [
  { value: "OPEN", label: "Berlangsung", badge: "success" as const },
  { value: "CLOSED", label: "Selesai", badge: "secondary" as const },
  { value: "NO_CLASS", label: "Kelas Kosong", badge: "warning" as const },
] as const;

export const SESSION_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  sessionStatusOptions.map((o) => [o.value, o.label]),
);

export const SESSION_STATUS_BADGES: Record<
  string,
  "success" | "warning" | "secondary"
> = Object.fromEntries(sessionStatusOptions.map((o) => [o.value, o.badge]));

export const leaveTypeOptions = [
  { value: "PERMISSION", label: "Izin", badge: "info" as const },
  { value: "SICK", label: "Sakit", badge: "secondary" as const },
] as const;

export const LEAVE_TYPE_VALUES = leaveTypeOptions.map((o) => o.value);

export const LEAVE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  leaveTypeOptions.map((o) => [o.value, o.label]),
);

export const leaveStatusOptions = [
  { value: "PENDING", label: "Menunggu", badge: "warning" as const },
  { value: "APPROVED", label: "Disetujui", badge: "success" as const },
  { value: "REJECTED", label: "Ditolak", badge: "destructive" as const },
] as const;

export const LEAVE_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  leaveStatusOptions.map((o) => [o.value, o.label]),
);

export const LEAVE_STATUS_BADGES: Record<
  string,
  "success" | "warning" | "destructive"
> = Object.fromEntries(leaveStatusOptions.map((o) => [o.value, o.badge]));

export const creditEntryTypeOptions = [
  { value: "ACHIEVEMENT", label: "Prestasi", badge: "success" as const },
  { value: "VIOLATION", label: "Pelanggaran", badge: "destructive" as const },
  { value: "CORRECTION", label: "Koreksi", badge: "info" as const },
] as const;

export const CREDIT_ENTRY_TYPE_VALUES = creditEntryTypeOptions.map(
  (o) => o.value,
);

export const CREDIT_ENTRY_TYPE_LABELS: Record<string, string> =
  Object.fromEntries(creditEntryTypeOptions.map((o) => [o.value, o.label]));

export const CREDIT_ENTRY_TYPE_BADGES: Record<
  string,
  "success" | "destructive" | "info"
> = Object.fromEntries(creditEntryTypeOptions.map((o) => [o.value, o.badge]));

export const creditOwnerTypeOptions = [
  { value: "STUDENT", label: ENTITY_LABELS.STUDENT },
  { value: "TEACHER", label: ENTITY_LABELS.TEACHER },
] as const;

export const CREDIT_OWNER_TYPE_VALUES = creditOwnerTypeOptions.map(
  (o) => o.value,
);

export const CREDIT_OWNER_TYPE_LABELS: Record<string, string> =
  Object.fromEntries(creditOwnerTypeOptions.map((o) => [o.value, o.label]));

export const employmentStatusOptions = [
  { value: "PNS", label: "PNS" },
  { value: "PPPK", label: "PPPK" },
  { value: "GTY", label: "Guru Tetap Yayasan" },
  { value: "GTT", label: "Guru Tidak Tetap" },
] as const;

export const EMPLOYMENT_STATUS_VALUES = employmentStatusOptions.map(
  (o) => o.value,
);

export const EMPLOYMENT_STATUS_LABELS: Record<string, string> =
  Object.fromEntries(employmentStatusOptions.map((o) => [o.value, o.label]));

export const studentStatusOptions = [
  { value: "AKTIF", label: "Aktif", badge: "success" as const },
  { value: "LULUS", label: "Lulus", badge: "info" as const },
  { value: "PINDAH", label: "Pindah", badge: "warning" as const },
  { value: "DROPOUT", label: "Dropout", badge: "destructive" as const },
] as const;

export const STUDENT_STATUS_VALUES = studentStatusOptions.map((o) => o.value);

export const STUDENT_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  studentStatusOptions.map((o) => [o.value, o.label]),
);

export const STUDENT_STATUS_BADGES: Record<
  string,
  "success" | "info" | "warning" | "destructive"
> = Object.fromEntries(studentStatusOptions.map((o) => [o.value, o.badge]));

export const gradeLevelOptions = [
  { value: 10, label: "Kelas 10" },
  { value: 11, label: "Kelas 11" },
  { value: 12, label: "Kelas 12" },
] as const;

export const dayOfWeekOptions = [
  { value: "MONDAY", label: "Senin" },
  { value: "TUESDAY", label: "Selasa" },
  { value: "WEDNESDAY", label: "Rabu" },
  { value: "THURSDAY", label: "Kamis" },
  { value: "FRIDAY", label: "Jumat" },
  { value: "SATURDAY", label: "Sabtu" },
] as const;

export const DAY_OF_WEEK_VALUES = dayOfWeekOptions.map((o) => o.value);

export const DAY_OF_WEEK_LABELS: Record<string, string> = Object.fromEntries(
  dayOfWeekOptions.map((o) => [o.value, o.label]),
);

export const testimonialTypeOptions = [
  { value: "ALUMNI", label: "Alumni", badge: "info" as const },
  { value: "PARENT", label: "Orang Tua", badge: "success" as const },
  { value: "TEACHER", label: ENTITY_LABELS.TEACHER, badge: "warning" as const },
  { value: "PARTNER", label: "Mitra", badge: "secondary" as const },
] as const;

export const TESTIMONIAL_TYPE_VALUES = testimonialTypeOptions.map(
  (o) => o.value,
);

export const TESTIMONIAL_TYPE_LABELS: Record<string, string> =
  Object.fromEntries(testimonialTypeOptions.map((o) => [o.value, o.label]));

export const TESTIMONIAL_TYPE_BADGES: Record<
  string,
  "info" | "success" | "warning" | "secondary"
> = Object.fromEntries(testimonialTypeOptions.map((o) => [o.value, o.badge]));
