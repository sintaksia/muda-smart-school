export const jenisKelaminOptions = [
  { value: "LAKI_LAKI", label: "Laki-laki" },
  { value: "PEREMPUAN", label: "Perempuan" },
] as const;

export const programKeahlianOptions = [
  {
    value: "TEKNIK_OTOMOTIF",
    label: "Teknik Otomotif",
    short: "TO",
    color: "#EF4444",
  },
  {
    value: "PEMROGRAMAN_PERANGKAT_LUNAK_DAN_GIM",
    label: "Pemrograman Perangkat Lunak dan Gim",
    short: "PPLG",
    color: "#32368C",
  },
  {
    value: "TEKNIK_JARINGAN_KOMPUTER_DAN_TELEKOMUNIKASI",
    label: "Teknik Jaringan Komputer dan Telekomunikasi",
    short: "TJKT",
    color: "#4CAF93",
  },
  {
    value: "MANAJEMEN_PERKANTORAN_DAN_LAYANAN_BISNIS",
    label: "Manajemen Perkantoran dan Layanan Bisnis",
    short: "MPLB",
    color: "#F2C94C",
  },
  {
    value: "AKUNTANSI_DAN_KEUANGAN_LEMBAGA",
    label: "Akuntansi dan Keuangan Lembaga",
    short: "AKL",
    color: "#9333EA",
  },
] as const;

export const PROGRAM_KEAHLIAN_LABELS: Record<string, string> =
  Object.fromEntries(
    programKeahlianOptions.map((option) => [option.value, option.label]),
  );

export const PROGRAM_KEAHLIAN_SHORT_LABELS: Record<string, string> =
  Object.fromEntries(
    programKeahlianOptions.map((option) => [option.value, option.short]),
  );

export const PROGRAM_KEAHLIAN_COLORS: Record<string, string> =
  Object.fromEntries(
    programKeahlianOptions.map((option) => [option.value, option.color]),
  );

export const pendidikanOptions = [
  { value: "TIDAK_SEKOLAH", label: "Tidak Sekolah" },
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

export const PENDIDIKAN_LABELS: Record<string, string> = Object.fromEntries(
  pendidikanOptions.map((option) => [option.value, option.label]),
);

export const statusPendaftaranOptions = [
  { value: "PENDING", label: "Menunggu", badge: "warning" as const },
  { value: "DIVERIFIKASI", label: "Terverifikasi", badge: "info" as const },
  { value: "DITERIMA", label: "Diterima", badge: "success" as const },
  { value: "DITOLAK", label: "Ditolak", badge: "destructive" as const },
] as const;

export const STATUS_PENDAFTARAN_VALUES = statusPendaftaranOptions.map(
  (option) => option.value,
);

export const STATUS_PENDAFTARAN_LABELS: Record<string, string> =
  Object.fromEntries(
    statusPendaftaranOptions.map((option) => [option.value, option.label]),
  );

export const STATUS_PENDAFTARAN_BADGES: Record<
  string,
  "success" | "warning" | "info" | "destructive"
> = Object.fromEntries(
  statusPendaftaranOptions.map((option) => [option.value, option.badge]),
);

/* ============================================================
 * Attendance & Credit Score system
 * ============================================================ */

export const absensiStatusOptions = [
  { value: "HADIR", label: "Hadir", badge: "success" as const },
  { value: "TERLAMBAT", label: "Terlambat", badge: "warning" as const },
  { value: "IZIN", label: "Izin", badge: "info" as const },
  { value: "SAKIT", label: "Sakit", badge: "secondary" as const },
  { value: "ALPHA", label: "Alpa", badge: "destructive" as const },
] as const;

export const ABSENSI_STATUS_VALUES = absensiStatusOptions.map((o) => o.value);

export const ABSENSI_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  absensiStatusOptions.map((o) => [o.value, o.label]),
);

export const ABSENSI_STATUS_BADGES: Record<
  string,
  "success" | "warning" | "info" | "secondary" | "destructive"
> = Object.fromEntries(absensiStatusOptions.map((o) => [o.value, o.badge]));

export const sesiStatusOptions = [
  { value: "OPEN", label: "Berlangsung", badge: "success" as const },
  { value: "CLOSED", label: "Selesai", badge: "secondary" as const },
  { value: "KELAS_KOSONG", label: "Kelas Kosong", badge: "warning" as const },
] as const;

export const SESI_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  sesiStatusOptions.map((o) => [o.value, o.label]),
);

export const SESI_STATUS_BADGES: Record<
  string,
  "success" | "warning" | "secondary"
> = Object.fromEntries(sesiStatusOptions.map((o) => [o.value, o.badge]));

export const izinJenisOptions = [
  { value: "IZIN", label: "Izin", badge: "info" as const },
  { value: "SAKIT", label: "Sakit", badge: "secondary" as const },
] as const;

export const IZIN_JENIS_VALUES = izinJenisOptions.map((o) => o.value);

export const IZIN_JENIS_LABELS: Record<string, string> = Object.fromEntries(
  izinJenisOptions.map((o) => [o.value, o.label]),
);

export const izinStatusOptions = [
  { value: "PENDING", label: "Menunggu", badge: "warning" as const },
  { value: "APPROVED", label: "Disetujui", badge: "success" as const },
  { value: "REJECTED", label: "Ditolak", badge: "destructive" as const },
] as const;

export const IZIN_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  izinStatusOptions.map((o) => [o.value, o.label]),
);

export const IZIN_STATUS_BADGES: Record<
  string,
  "success" | "warning" | "destructive"
> = Object.fromEntries(izinStatusOptions.map((o) => [o.value, o.badge]));

export const creditEntryTypeOptions = [
  { value: "PRESTASI", label: "Prestasi", badge: "success" as const },
  { value: "PELANGGARAN", label: "Pelanggaran", badge: "destructive" as const },
  { value: "KOREKSI", label: "Koreksi", badge: "info" as const },
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
  { value: "STUDENT", label: "Siswa" },
  { value: "TEACHER", label: "Guru" },
] as const;

export const CREDIT_OWNER_TYPE_VALUES = creditOwnerTypeOptions.map(
  (o) => o.value,
);

export const CREDIT_OWNER_TYPE_LABELS: Record<string, string> =
  Object.fromEntries(creditOwnerTypeOptions.map((o) => [o.value, o.label]));

export const statusKepegawaianOptions = [
  { value: "PNS", label: "PNS" },
  { value: "PPPK", label: "PPPK" },
  { value: "GTY", label: "Guru Tetap Yayasan" },
  { value: "GTT", label: "Guru Tidak Tetap" },
] as const;

export const STATUS_KEPEGAWAIAN_VALUES = statusKepegawaianOptions.map(
  (o) => o.value,
);

export const STATUS_KEPEGAWAIAN_LABELS: Record<string, string> =
  Object.fromEntries(statusKepegawaianOptions.map((o) => [o.value, o.label]));

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

export const tingkatOptions = [
  { value: 10, label: "Kelas 10" },
  { value: 11, label: "Kelas 11" },
  { value: 12, label: "Kelas 12" },
] as const;

export const hariOptions = [
  { value: "SENIN", label: "Senin" },
  { value: "SELASA", label: "Selasa" },
  { value: "RABU", label: "Rabu" },
  { value: "KAMIS", label: "Kamis" },
  { value: "JUMAT", label: "Jumat" },
  { value: "SABTU", label: "Sabtu" },
] as const;

export const HARI_VALUES = hariOptions.map((o) => o.value);

export const HARI_LABELS: Record<string, string> = Object.fromEntries(
  hariOptions.map((o) => [o.value, o.label]),
);
