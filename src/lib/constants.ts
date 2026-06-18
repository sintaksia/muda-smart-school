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

export const STATUS_PENDAFTARAN_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  DIVERIFIKASI: "Terverifikasi",
  DITERIMA: "Diterima",
  DITOLAK: "Ditolak",
};
