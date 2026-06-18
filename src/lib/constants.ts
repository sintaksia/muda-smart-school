export const jenisKelaminOptions = [
  { value: "LAKI_LAKI", label: "Laki-laki" },
  { value: "PEREMPUAN", label: "Perempuan" },
] as const;

export const programKeahlianOptions = [
  { value: "TEKNIK_OTOMOTIF", label: "Teknik Otomotif" },
  {
    value: "PEMROGRAMAN_PERANGKAT_LUNAK_DAN_GIM",
    label: "Pemrograman Perangkat Lunak dan Gim",
  },
  {
    value: "TEKNIK_JARINGAN_KOMPUTER_DAN_TELEKOMUNIKASI",
    label: "Teknik Jaringan Komputer dan Telekomunikasi",
  },
  {
    value: "MANAJEMEN_PERKANTORAN_DAN_LAYANAN_BISNIS",
    label: "Manajemen Perkantoran dan Layanan Bisnis",
  },
  {
    value: "AKUNTANSI_DAN_KEUANGAN_LEMBAGA",
    label: "Akuntansi dan Keuangan Lembaga",
  },
] as const;

export const PROGRAM_KEAHLIAN_LABELS: Record<string, string> =
  Object.fromEntries(
    programKeahlianOptions.map((option) => [option.value, option.label]),
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

// `badge` targets the single shared Badge component
// (src/app/admin/_components/Badge.tsx), which already covers every variant
// the app needs (success | warning | info | destructive | default | secondary | outline).
// Always import Badge from there for status pills — never from
// src/components/ui/badge — so there is only one variant set to keep in sync.
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
