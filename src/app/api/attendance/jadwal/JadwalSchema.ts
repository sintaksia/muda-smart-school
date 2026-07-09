import { z } from "zod";
import { HARI_VALUES } from "@/src/lib/constants";

const timePattern = /^([01]?\d|2[0-3]):[0-5]\d$/;

export const jadwalSchema = z.object({
  kelasId: z.string({ message: "Kelas wajib dipilih" }).min(1),
  mataPelajaranId: z.string({ message: "Mapel wajib dipilih" }).min(1),
  guruId: z.string({ message: "Guru wajib dipilih" }).min(1),
  hari: z.enum(
    HARI_VALUES as ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"],
    { message: "Hari wajib dipilih" },
  ),
  jamMulai: z.string().regex(timePattern, { message: "Jam mulai tidak valid" }),
  jamSelesai: z
    .string()
    .regex(timePattern, { message: "Jam selesai tidak valid" }),
  tahunAjaran: z.string().optional(),
});

export type JadwalFormData = z.infer<typeof jadwalSchema>;
