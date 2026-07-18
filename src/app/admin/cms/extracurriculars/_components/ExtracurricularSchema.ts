import { z } from "zod";

export const ekskulCategories = [
  { value: "ORGANISASI", label: "Organisasi" },
  { value: "KEPANDUAN", label: "Kepanduan" },
  { value: "BELADIRI", label: "Beladiri" },
  { value: "OLAHRAGA", label: "Olahraga" },
  { value: "SENI", label: "Seni" },
  { value: "AKADEMIK", label: "Akademik" },
  { value: "KEAGAMAAN", label: "Keagamaan" },
  { value: "LAINNYA", label: "Lainnya" },
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
