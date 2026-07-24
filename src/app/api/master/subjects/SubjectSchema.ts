import { z } from "zod";
import { specializationOptions } from "@/src/lib/constants";

const SPECIALIZATION_VALUES = specializationOptions.map((o) => o.value) as [
  "AUTOMOTIVE_ENGINEERING",
  "SOFTWARE_AND_GAME_DEVELOPMENT",
  "NETWORK_AND_TELECOMMUNICATIONS_ENGINEERING",
  "OFFICE_MANAGEMENT_AND_BUSINESS_SERVICES",
  "ACCOUNTING_AND_INSTITUTIONAL_FINANCE",
];

export const subjectSchema = z.object({
  name: z.string({ message: "Nama mapel wajib diisi" }).min(2),
  code: z
    .string({ message: "Kode mapel wajib diisi" })
    .min(2)
    .max(12)
    .transform((value) => value.toUpperCase()),
  specialization: z.enum(SPECIALIZATION_VALUES).optional().nullable(),
  gradeLevel: z.number().int().min(10).max(12).optional().nullable(),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;
