import { z } from "zod";
import {
  jenisKelaminOptions,
  pendidikanOptions,
  STATUS_KEPEGAWAIAN_VALUES,
} from "@/src/lib/constants";

const JENIS_KELAMIN_VALUES = jenisKelaminOptions.map((o) => o.value) as [
  "LAKI_LAKI",
  "PEREMPUAN",
];
const PENDIDIKAN_VALUES = pendidikanOptions.map((o) => o.value) as [
  "TIDAK_SEKOLAH",
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
  jenisKelamin: z.enum(JENIS_KELAMIN_VALUES, {
    message: "Jenis kelamin wajib dipilih",
  }),
  tempatLahir: z.string({ message: "Tempat lahir wajib diisi" }).min(2),
  tanggalLahir: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Tanggal lahir tidak valid" }),
  pendidikanTerakhir: z.enum(PENDIDIKAN_VALUES, {
    message: "Pendidikan wajib dipilih",
  }),
  jabatan: z.string().optional(),
  statusKepegawaian: z.enum(
    STATUS_KEPEGAWAIAN_VALUES as ["PNS", "PPPK", "GTY", "GTT"],
    { message: "Status kepegawaian wajib dipilih" },
  ),
  mataPelajaranIds: z
    .array(z.string())
    .min(1, { message: "Pilih minimal satu mapel" }),
});

export const updateGuruSchema = z.object({
  nip: z.string().optional().nullable(),
  nuptk: z.string().optional().nullable(),
  jabatan: z.string().optional().nullable(),
  statusKepegawaian: z
    .enum(STATUS_KEPEGAWAIAN_VALUES as ["PNS", "PPPK", "GTY", "GTT"])
    .optional(),
  mataPelajaranIds: z.array(z.string()).min(1).optional(),
});

export type CreateGuruFormData = z.infer<typeof createGuruSchema>;
