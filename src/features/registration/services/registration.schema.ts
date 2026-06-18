import { z } from "zod";
import {
  jenisKelaminOptions,
  programKeahlianOptions,
  pendidikanOptions,
} from "@/src/lib/constants";

export { jenisKelaminOptions, programKeahlianOptions, pendidikanOptions };

const jenisKelaminValues = jenisKelaminOptions.map((o) => o.value) as [
  (typeof jenisKelaminOptions)[number]["value"],
  ...(typeof jenisKelaminOptions)[number]["value"][],
];
const programKeahlianValues = programKeahlianOptions.map((o) => o.value) as [
  (typeof programKeahlianOptions)[number]["value"],
  ...(typeof programKeahlianOptions)[number]["value"][],
];
const pendidikanValues = pendidikanOptions.map((o) => o.value) as [
  (typeof pendidikanOptions)[number]["value"],
  ...(typeof pendidikanOptions)[number]["value"][],
];

export const registrasiSchema = z.object({
  // Identitas Diri
  namaLengkap: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  jenisKelamin: z.enum(jenisKelaminValues, {
    message: "Pilih jenis kelamin",
  }),
  programKeahlian: z.enum(programKeahlianValues, {
    message: "Pilih program keahlian",
  }),
  nisn: z
    .string()
    .length(10, "NISN harus 10 digit")
    .regex(/^\d+$/, "NISN hanya boleh angka"),
  nik: z
    .string()
    .length(16, "NIK harus 16 digit")
    .regex(/^\d+$/, "NIK hanya boleh angka"),
  nomorKk: z
    .string()
    .length(16, "Nomor KK harus 16 digit")
    .regex(/^\d+$/, "Nomor KK hanya boleh angka"),
  tempatLahir: z.string().min(2, "Tempat lahir minimal 2 karakter"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  noHpMurid: z
    .string()
    .refine(
      (val) => val === "" || /^\d+$/.test(val),
      "Nomor HP hanya boleh angka",
    ),
  emailMurid: z
    .string()
    .email("Email tidak valid")
    .optional()
    .or(z.literal("")),
  noTelpAyah: z
    .string()
    .refine(
      (val) => val === "" || /^\d+$/.test(val),
      "Nomor telepon hanya boleh angka",
    )
    .optional(),
  noTelpIbu: z
    .string()
    .refine(
      (val) => val === "" || /^\d+$/.test(val),
      "Nomor telepon hanya boleh angka",
    )
    .optional(),

  // Alamat
  alamatJalan: z.string().min(5, "Alamat minimal 5 karakter"),
  rt: z.string().min(1, "RT wajib diisi").max(3, "RT maksimal 3 digit"),
  rw: z.string().min(1, "RW wajib diisi").max(3, "RW maksimal 3 digit"),
  kelurahanDesa: z.string().min(2, "Kelurahan/Desa minimal 2 karakter"),
  kecamatan: z.string().min(2, "Kecamatan minimal 2 karakter"),
  kotaKabupaten: z.string().min(2, "Kota/Kabupaten minimal 2 karakter"),
  provinsi: z.string().min(2, "Provinsi minimal 2 karakter"),
  kodePos: z
    .string()
    .regex(/^\d+$/, "Kode pos hanya boleh angka")
    .length(5, "Kode pos harus 5 digit")
    .optional()
    .or(z.literal("")),

  // Data Ayah
  namaAyah: z.string().min(3, "Nama ayah minimal 3 karakter"),
  tahunLahirAyah: z
    .string()
    .refine(
      (val) => val === "" || /^\d+$/.test(val),
      "Tahun lahir hanya boleh angka",
    ),
  pendidikanAyah: z.enum(pendidikanValues, {
    message: "Pilih pendidikan ayah",
  }),
  pekerjaanAyah: z.string(),

  // Data Ibu
  namaIbu: z.string().min(3, "Nama ibu minimal 3 karakter"),
  tahunLahirIbu: z
    .string()
    .refine(
      (val) => val === "" || /^\d+$/.test(val),
      "Tahun lahir hanya boleh angka",
    ),
  pendidikanIbu: z.enum(pendidikanValues, {
    message: "Pilih pendidikan ibu",
  }),
  pekerjaanIbu: z.string(),

  // Data Wali (Opsional)
  namaWali: z.string().optional(),
  tahunLahirWali: z
    .string()
    .refine(
      (val) => val === "" || /^\d+$/.test(val),
      "Tahun lahir hanya boleh angka",
    )
    .optional(),
  pendidikanWali: z
    .enum(pendidikanValues, { message: "Pilih pendidikan wali" })
    .optional(),
  pekerjaanWali: z.string().optional(),
  noTelpWali: z
    .string()
    .refine(
      (val) => val === "" || /^\d+$/.test(val),
      "Nomor telepon hanya boleh angka",
    )
    .optional(),
  hubunganWali: z.string().optional(),

  // Asal Sekolah
  namaAsalSekolah: z.string().min(3, "Nama sekolah minimal 3 karakter"),
  npsnAsalSekolah: z
    .string()
    .refine((val) => val === "" || /^\d+$/.test(val), "NPSN hanya boleh angka"),
  alamatAsalSekolah: z.string().min(5, "Alamat sekolah minimal 5 karakter"),
  tahunLulus: z
    .string()
    .regex(/^\d+$/, "Tahun lulus hanya boleh angka")
    .length(4, "Tahun lulus harus 4 digit")
    .refine((val) => {
      const year = parseInt(val);
      const currentYear = new Date().getFullYear();
      return year >= 2022 && year <= currentYear;
    }, `Tahun lulus harus antara 2022-${new Date().getFullYear()}`),
});

export type RegistrasiFormData = z.infer<typeof registrasiSchema>;

// Fields with min/length validation (required fields)
export const requiredFields: Set<keyof RegistrasiFormData> = new Set([
  "namaLengkap",
  "jenisKelamin",
  "programKeahlian",
  "nisn",
  "nik",
  "nomorKk",
  "tempatLahir",
  "tanggalLahir",
  "noHpMurid",
  "alamatJalan",
  "rt",
  "rw",
  "kelurahanDesa",
  "kecamatan",
  "kotaKabupaten",
  "provinsi",
  "namaAyah",
  "pendidikanAyah",
  "namaIbu",
  "pendidikanIbu",
  "namaAsalSekolah",
  "alamatAsalSekolah",
  "tahunLulus",
  "pekerjaanAyah",
  "pekerjaanIbu",
  "npsnAsalSekolah",
  "tahunLahirAyah",
  "tahunLahirIbu",
]);
