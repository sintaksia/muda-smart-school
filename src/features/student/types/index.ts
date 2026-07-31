import type { Student, StudentStatus } from "@prisma/client";

// Re-export Prisma types
export type { Student, StudentStatus };

export interface CreateStudentFromRegistrationInput {
  registrationId: string;
  nis: string;
  angkatan: number;
  password: string;
  /**
   * Login email override, used by the bulk sync when the registration itself
   * has no `studentEmail`. Falls back to the registration's own email.
   */
  email?: string;
}
