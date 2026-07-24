import { z } from "zod";

export const ekskulCategories = [
  { value: "ORGANIZATION", label: "Organisasi" },
  { value: "SCOUTING", label: "Kepanduan" },
  { value: "MARTIAL_ARTS", label: "Beladiri" },
  { value: "SPORTS", label: "Olahraga" },
  { value: "ARTS", label: "Seni" },
  { value: "ACADEMIC", label: "Akademik" },
  { value: "RELIGIOUS", label: "Keagamaan" },
  { value: "OTHER", label: "Lainnya" },
] as const;

const ekskulCategoryValues = ekskulCategories.map((c) => c.value) as [
  (typeof ekskulCategories)[number]["value"],
  ...(typeof ekskulCategories)[number]["value"][],
];

export const extracurricularSchema = z.object({
  name: z.string().min(1, "Nama ekstrakurikuler wajib diisi"),
  description: z.string().optional().nullable(),
  category: z.enum(ekskulCategoryValues, {
    message: "Kategori wajib dipilih",
  }),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export type ExtracurricularFormData = z.infer<typeof extracurricularSchema>;
