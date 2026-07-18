import { z } from "zod";

export const galleryCategories = [
  { value: "FASILITAS", label: "Fasilitas" },
  { value: "KEGIATAN", label: "Kegiatan" },
  { value: "PRESTASI", label: "Prestasi" },
  { value: "EKSKUL", label: "Ekskul" },
  { value: "LAINNYA", label: "Lainnya" },
] as const;

const galleryCategoryValues = galleryCategories.map((c) => c.value) as [
  (typeof galleryCategories)[number]["value"],
  ...(typeof galleryCategories)[number]["value"][],
];

export const gallerySchema = z.object({
  title: z.string().min(1, "Judul galeri wajib diisi"),
  description: z.string().nullable().optional(),
  image: z.string().min(1, "Gambar wajib diunggah"),
  category: z.enum(galleryCategoryValues, {
    message: "Kategori wajib dipilih",
  }),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export type GalleryFormData = z.infer<typeof gallerySchema>;
