import { z } from "zod";
import { programKeahlianOptions } from "@/src/lib/constants";

const PROGRAM_VALUES = programKeahlianOptions.map((o) => o.value) as [
  string,
  ...string[],
];

export const kelasSchema = z.object({
  nama: z.string({ message: "Nama kelas wajib diisi" }).min(2),
  tingkat: z.number({ message: "Tingkat wajib dipilih" }).int().min(10).max(12),
  programKeahlian: z.enum(
    PROGRAM_VALUES as [
      "TEKNIK_OTOMOTIF",
      "PEMROGRAMAN_PERANGKAT_LUNAK_DAN_GIM",
      "TEKNIK_JARINGAN_KOMPUTER_DAN_TELEKOMUNIKASI",
      "MANAJEMEN_PERKANTORAN_DAN_LAYANAN_BISNIS",
      "AKUNTANSI_DAN_KEUANGAN_LEMBAGA",
    ],
    { message: "Program keahlian wajib dipilih" },
  ),
  tahunAjaran: z
    .string()
    .regex(/^\d{4}\/\d{4}$/, { message: "Format tahun ajaran: 2026/2027" }),
  waliKelasId: z.string().optional().nullable(),
});

export type KelasFormData = z.infer<typeof kelasSchema>;
