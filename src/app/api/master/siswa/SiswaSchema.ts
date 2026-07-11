import { z } from "zod";
import {
  PROGRAM_KEAHLIAN_VALUES,
  STUDENT_STATUS_VALUES,
} from "@/src/lib/constants";

type ProgramKeahlianTuple = [
  "TEKNIK_OTOMOTIF",
  "PEMROGRAMAN_PERANGKAT_LUNAK_DAN_GIM",
  "TEKNIK_JARINGAN_KOMPUTER_DAN_TELEKOMUNIKASI",
  "MANAJEMEN_PERKANTORAN_DAN_LAYANAN_BISNIS",
  "AKUNTANSI_DAN_KEUANGAN_LEMBAGA",
];
type StudentStatusTuple = ["AKTIF", "LULUS", "PINDAH", "DROPOUT"];

export const createSiswaSchema = z.object({
  name: z
    .string({ message: "Nama wajib diisi" })
    .min(3, { message: "Nama minimal 3 karakter" }),
  email: z.email({ message: "Email tidak valid" }),
  password: z
    .string({ message: "Password wajib diisi" })
    .min(8, { message: "Password minimal 8 karakter" }),
  phone: z.string().optional(),
  nis: z.string({ message: "NIS wajib diisi" }).min(1, {
    message: "NIS wajib diisi",
  }),
  nisn: z
    .string({ message: "NISN wajib diisi" })
    .regex(/^\d{10}$/, { message: "NISN harus 10 digit angka" }),
  programKeahlian: z.enum(PROGRAM_KEAHLIAN_VALUES as ProgramKeahlianTuple, {
    message: "Program keahlian wajib dipilih",
  }),
  angkatan: z
    .number({ message: "Angkatan wajib diisi" })
    .int({ message: "Angkatan tidak valid" })
    .min(2000, { message: "Angkatan tidak valid" }),
  kelasId: z.string().optional().nullable(),
  status: z
    .enum(STUDENT_STATUS_VALUES as StudentStatusTuple, {
      message: "Status tidak valid",
    })
    .optional(),
});

export const updateSiswaCoreSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }).optional(),
  phone: z.string().optional().nullable(),
  nis: z.string().min(1, { message: "NIS wajib diisi" }).optional(),
  nisn: z
    .string()
    .regex(/^\d{10}$/, { message: "NISN harus 10 digit angka" })
    .optional(),
  programKeahlian: z
    .enum(PROGRAM_KEAHLIAN_VALUES as ProgramKeahlianTuple, {
      message: "Program keahlian tidak valid",
    })
    .optional(),
  angkatan: z
    .number({ message: "Angkatan tidak valid" })
    .int({ message: "Angkatan tidak valid" })
    .min(2000, { message: "Angkatan tidak valid" })
    .optional(),
  kelasId: z.string().optional().nullable(),
  status: z
    .enum(STUDENT_STATUS_VALUES as StudentStatusTuple, {
      message: "Status tidak valid",
    })
    .optional(),
});

export const bulkSiswaSchema = z
  .object({
    action: z.enum(["PROMOTE", "GRADUATE"], {
      message: "Aksi tidak valid",
    }),
    studentIds: z
      .array(z.string())
      .min(1, { message: "Pilih minimal satu siswa" }),
    targetKelasId: z.string().optional(),
  })
  .refine((data) => data.action !== "PROMOTE" || Boolean(data.targetKelasId), {
    message: "Kelas tujuan wajib dipilih",
    path: ["targetKelasId"],
  });

export type CreateSiswaFormData = z.infer<typeof createSiswaSchema>;
export type UpdateSiswaCoreFormData = z.infer<typeof updateSiswaCoreSchema>;
