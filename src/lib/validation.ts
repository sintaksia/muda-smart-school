import { z } from "zod";

/**
 * The account password policy, shared by every place that sets one: user
 * creation, student creation and the reset-password dialog.
 */
export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password harus mengandung huruf besar, huruf kecil, dan angka",
  );

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
