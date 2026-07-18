import { z } from "zod";

export const faqSchema = z.object({
  question: z.string().min(1, "Pertanyaan wajib diisi"),
  answer: z.string().min(1, "Jawaban wajib diisi"),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export type FaqFormData = z.infer<typeof faqSchema>;
