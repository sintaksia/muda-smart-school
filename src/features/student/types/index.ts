import type { Student, StudentStatus } from "@prisma/client";

// Re-export Prisma types
export type { Student, StudentStatus };

export interface CreateStudentFromRegistrationInput {
  registrationId: string;
  nis: string;
  angkatan: number;
  password: string;
}
