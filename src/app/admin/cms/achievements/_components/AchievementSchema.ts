import { z } from "zod";

export const achievementLevels = [
  { value: "INTERNATIONAL", label: "Internasional" },
  { value: "NATIONAL", label: "Nasional" },
  { value: "PROVINCE", label: "Provinsi" },
  { value: "CITY", label: "Kota/Kabupaten" },
  { value: "DISTRICT", label: "Kecamatan" },
  { value: "SCHOOL", label: "Sekolah" },
] as const;

export const medalTypes = [
  { value: "GOLD", label: "Medali Emas" },
  { value: "SILVER", label: "Medali Perak" },
  { value: "BRONZE", label: "Medali Perunggu" },
  { value: "FIRST_PLACE", label: "Juara 1" },
  { value: "SECOND_PLACE", label: "Juara 2" },
  { value: "THIRD_PLACE", label: "Juara 3" },
  { value: "HONORABLE_MENTION_1", label: "Harapan 1" },
  { value: "HONORABLE_MENTION_2", label: "Harapan 2" },
  { value: "HONORABLE_MENTION_3", label: "Harapan 3" },
] as const;

const achievementLevelValues = achievementLevels.map((l) => l.value) as [
  (typeof achievementLevels)[number]["value"],
  ...(typeof achievementLevels)[number]["value"][],
];
const medalTypeValues = medalTypes.map((m) => m.value) as [
  (typeof medalTypes)[number]["value"],
  ...(typeof medalTypes)[number]["value"][],
];

export const achievementSchema = z.object({
  title: z.string().min(1, "Judul prestasi wajib diisi"),
  event: z.string().min(1, "Nama event/kompetisi wajib diisi"),
  level: z.enum(achievementLevelValues, {
    message: "Tingkat wajib dipilih",
  }),
  medalType: z.enum(medalTypeValues).nullable().optional(),
  year: z
    .number()
    .int()
    .min(2000, "Tahun minimal 2000")
    .max(new Date().getFullYear(), "Tahun tidak boleh melebihi tahun ini"),
  image: z.string().optional(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
  isHighlight: z.boolean(),
});

export type AchievementFormData = z.infer<typeof achievementSchema>;
