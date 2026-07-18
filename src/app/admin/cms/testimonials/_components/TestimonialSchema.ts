import { z } from "zod";
import { TESTIMONIAL_TYPE_VALUES } from "@/src/lib/constants";

export const testimonialSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  role: z.string().min(1, "Peran wajib diisi"),
  quote: z.string().min(1, "Testimoni wajib diisi"),
  type: z.enum(TESTIMONIAL_TYPE_VALUES, {
    message: "Tipe wajib dipilih",
  }),
  image: z.string().nullable().optional(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;
