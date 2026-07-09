import { z } from "zod";
import { programKeahlianOptions } from "@/src/lib/constants";

const PROGRAM_VALUES = programKeahlianOptions.map((o) => o.value) as [
  "TEKNIK_OTOMOTIF",
  "PEMROGRAMAN_PERANGKAT_LUNAK_DAN_GIM",
  "TEKNIK_JARINGAN_KOMPUTER_DAN_TELEKOMUNIKASI",
  "MANAJEMEN_PERKANTORAN_DAN_LAYANAN_BISNIS",
  "AKUNTANSI_DAN_KEUANGAN_LEMBAGA",
];

export const mapelSchema = z.object({
  nama: z.string({ message: "Nama mapel wajib diisi" }).min(2),
  kode: z
    .string({ message: "Kode mapel wajib diisi" })
    .min(2)
    .max(12)
    .transform((value) => value.toUpperCase()),
  programKeahlian: z.enum(PROGRAM_VALUES).optional().nullable(),
  tingkat: z.number().int().min(10).max(12).optional().nullable(),
});

export type MapelFormData = z.infer<typeof mapelSchema>;
