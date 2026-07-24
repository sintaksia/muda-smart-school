import { z } from "zod";
import {
  genderOptions,
  educationOptions,
  EMPLOYMENT_STATUS_VALUES,
} from "@/src/lib/constants";

const GENDER_VALUES = genderOptions.map((o) => o.value) as ["MALE", "FEMALE"];
const EDUCATION_VALUES = educationOptions.map((o) => o.value) as [
  "NO_SCHOOLING",
  "SD",
  "SMP",
  "SMA",
  "SMK",
  "D1",
  "D2",
  "D3",
  "D4",
  "S1",
  "S2",
  "S3",
];

export const createGuruSchema = z.object({
  name: z.string({ message: "Nama wajib diisi" }).min(3),
  email: z.email({ message: "Email tidak valid" }),
  password: z
    .string({ message: "Password wajib diisi" })
    .min(8, { message: "Password minimal 8 karakter" }),
  phone: z.string().optional(),
  nip: z.string().optional(),
  nuptk: z.string().optional(),
  gender: z.enum(GENDER_VALUES, {
    message: "Jenis kelamin wajib dipilih",
  }),
  birthPlace: z.string({ message: "Tempat lahir wajib diisi" }).min(2),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Tanggal lahir tidak valid" }),
  education: z.enum(EDUCATION_VALUES, {
    message: "Pendidikan wajib dipilih",
  }),
  position: z.string().optional(),
  employmentStatus: z.enum(
    EMPLOYMENT_STATUS_VALUES as ["PNS", "PPPK", "GTY", "GTT"],
    { message: "Status kepegawaian wajib dipilih" },
  ),
  subjectIds: z
    .array(z.string())
    .min(1, { message: "Pilih minimal satu mapel" }),
});

export const updateGuruSchema = z.object({
  nip: z.string().optional().nullable(),
  nuptk: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  employmentStatus: z
    .enum(EMPLOYMENT_STATUS_VALUES as ["PNS", "PPPK", "GTY", "GTT"])
    .optional(),
  subjectIds: z.array(z.string()).min(1).optional(),
});

export type CreateGuruFormData = z.infer<typeof createGuruSchema>;
