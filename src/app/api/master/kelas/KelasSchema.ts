import { z } from "zod";
import { specializationOptions } from "@/src/lib/constants";

const SPECIALIZATION_VALUES = specializationOptions.map((o) => o.value) as [
  string,
  ...string[],
];

export const kelasSchema = z.object({
  nama: z.string({ message: "Nama kelas wajib diisi" }).min(2),
  tingkat: z.number({ message: "Tingkat wajib dipilih" }).int().min(10).max(12),
  specialization: z.enum(
    SPECIALIZATION_VALUES as [
      "AUTOMOTIVE_ENGINEERING",
      "SOFTWARE_AND_GAME_DEVELOPMENT",
      "NETWORK_AND_TELECOMMUNICATIONS_ENGINEERING",
      "OFFICE_MANAGEMENT_AND_BUSINESS_SERVICES",
      "ACCOUNTING_AND_INSTITUTIONAL_FINANCE",
    ],
    { message: "Program keahlian wajib dipilih" },
  ),
  tahunAjaran: z
    .string()
    .regex(/^\d{4}\/\d{4}$/, { message: "Format tahun ajaran: 2026/2027" }),
  waliKelasId: z.string().optional().nullable(),
});

export type KelasFormData = z.infer<typeof kelasSchema>;
