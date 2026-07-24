import { z } from "zod";
import {
  genderOptions,
  specializationOptions,
  educationOptions,
} from "@/src/lib/constants";

export { genderOptions, specializationOptions, educationOptions };

const genderValues = genderOptions.map((o) => o.value) as [
  (typeof genderOptions)[number]["value"],
  ...(typeof genderOptions)[number]["value"][],
];
const specializationValues = specializationOptions.map((o) => o.value) as [
  (typeof specializationOptions)[number]["value"],
  ...(typeof specializationOptions)[number]["value"][],
];
const educationValues = educationOptions.map((o) => o.value) as [
  (typeof educationOptions)[number]["value"],
  ...(typeof educationOptions)[number]["value"][],
];

export const registrasiSchema = z.object({
  // Identitas Diri
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  gender: z.enum(genderValues, {
    message: "Pilih jenis kelamin",
  }),
  specialization: z.enum(specializationValues, {
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
  familyCardNumber: z
    .string()
    .length(16, "Nomor KK harus 16 digit")
    .regex(/^\d+$/, "Nomor KK hanya boleh angka"),
  birthPlace: z.string().min(2, "Tempat lahir minimal 2 karakter"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  studentPhone: z
    .string()
    .refine(
      (val) => val === "" || /^\d+$/.test(val),
      "Nomor HP hanya boleh angka",
    ),
  studentEmail: z
    .string()
    .email("Email tidak valid")
    .optional()
    .or(z.literal("")),
  fatherPhone: z
    .string()
    .refine(
      (val) => val === "" || /^\d+$/.test(val),
      "Nomor telepon hanya boleh angka",
    )
    .optional(),
  motherPhone: z
    .string()
    .refine(
      (val) => val === "" || /^\d+$/.test(val),
      "Nomor telepon hanya boleh angka",
    )
    .optional(),

  // Alamat
  streetAddress: z.string().min(5, "Alamat minimal 5 karakter"),
  rt: z.string().min(1, "RT wajib diisi").max(3, "RT maksimal 3 digit"),
  rw: z.string().min(1, "RW wajib diisi").max(3, "RW maksimal 3 digit"),
  village: z.string().min(2, "Kelurahan/Desa minimal 2 karakter"),
  district: z.string().min(2, "Kecamatan minimal 2 karakter"),
  city: z.string().min(2, "Kota/Kabupaten minimal 2 karakter"),
  province: z.string().min(2, "Provinsi minimal 2 karakter"),
  postalCode: z
    .string()
    .regex(/^\d+$/, "Kode pos hanya boleh angka")
    .length(5, "Kode pos harus 5 digit")
    .optional()
    .or(z.literal("")),

  // Data Ayah
  fatherName: z.string().min(3, "Nama ayah minimal 3 karakter"),
  fatherBirthYear: z
    .string()
    .regex(/^\d{4}$/, "Tahun lahir harus 4 digit angka"),
  fatherEducation: z.enum(educationValues, {
    message: "Pilih pendidikan ayah",
  }),
  fatherOccupation: z.string(),

  // Data Ibu
  motherName: z.string().min(3, "Nama ibu minimal 3 karakter"),
  motherBirthYear: z
    .string()
    .regex(/^\d{4}$/, "Tahun lahir harus 4 digit angka"),
  motherEducation: z.enum(educationValues, {
    message: "Pilih pendidikan ibu",
  }),
  motherOccupation: z.string(),

  // Data Wali (Opsional)
  guardianName: z.string().optional(),
  guardianBirthYear: z
    .string()
    .refine(
      (val) => val === "" || /^\d+$/.test(val),
      "Tahun lahir hanya boleh angka",
    )
    .optional(),
  guardianEducation: z
    .enum(educationValues, { message: "Pilih pendidikan wali" })
    .optional(),
  guardianOccupation: z.string().optional(),
  guardianPhone: z
    .string()
    .refine(
      (val) => val === "" || /^\d+$/.test(val),
      "Nomor telepon hanya boleh angka",
    )
    .optional(),
  guardianRelationship: z.string().optional(),

  // Asal Sekolah
  previousSchoolName: z.string().min(3, "Nama sekolah minimal 3 karakter"),
  previousSchoolNpsn: z
    .string()
    .refine((val) => val === "" || /^\d+$/.test(val), "NPSN hanya boleh angka"),
  previousSchoolAddress: z.string().min(5, "Alamat sekolah minimal 5 karakter"),
  graduationYear: z
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
  "fullName",
  "gender",
  "specialization",
  "nisn",
  "nik",
  "familyCardNumber",
  "birthPlace",
  "birthDate",
  "studentPhone",
  "streetAddress",
  "rt",
  "rw",
  "village",
  "district",
  "city",
  "province",
  "fatherName",
  "fatherEducation",
  "motherName",
  "motherEducation",
  "previousSchoolName",
  "previousSchoolAddress",
  "graduationYear",
  "fatherOccupation",
  "motherOccupation",
  "previousSchoolNpsn",
  "fatherBirthYear",
  "motherBirthYear",
]);
