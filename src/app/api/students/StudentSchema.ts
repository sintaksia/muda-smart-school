import { z } from "zod";

export const createStudentFromRegistrationSchema = z.object({
  pendaftaranId: z.string().min(1, "Pendaftaran wajib dipilih"),
  nis: z.string().min(1, "NIS wajib diisi"),
  angkatan: z
    .number({ message: "Angkatan wajib diisi" })
    .int()
    .min(2000, "Angkatan tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password harus mengandung huruf besar, huruf kecil, dan angka",
    ),
});

export type CreateStudentFromRegistrationFormData = z.infer<
  typeof createStudentFromRegistrationSchema
>;
