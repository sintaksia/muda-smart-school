import type { Student, StudentStatus } from "@prisma/client";

// Re-export Prisma types
export type { Student, StudentStatus };

export interface CreateStudentFromRegistrationInput {
  pendaftaranId: string;
  nis: string;
  angkatan: number;
  password: string;
}
