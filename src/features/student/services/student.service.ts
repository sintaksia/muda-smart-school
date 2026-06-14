import { prisma } from "@/src/lib/prisma";
import { createUser } from "@/src/features/auth/services/users";
import { getRegistrationById } from "@/src/features/registration/services";
import type { Student } from "@prisma/client";
import type { CreateStudentFromRegistrationInput } from "../types";

/**
 * Create a Student account (Supabase Auth + User + Student) from an
 * accepted (DITERIMA) registration.
 */
export async function createStudentFromRegistration(
  input: CreateStudentFromRegistrationInput,
  createdById?: string,
): Promise<{ student: Student | null; error: string | null }> {
  try {
    const registration = await getRegistrationById(input.pendaftaranId);

    if (!registration) {
      return { student: null, error: "Pendaftaran tidak ditemukan" };
    }

    if (registration.status !== "DITERIMA") {
      return {
        student: null,
        error: "Pendaftaran belum diterima (status harus DITERIMA)",
      };
    }

    if (registration.student) {
      return {
        student: null,
        error: "Akun siswa sudah pernah dibuat untuk pendaftaran ini",
      };
    }

    if (!registration.emailMurid) {
      return {
        student: null,
        error: "Pendaftaran belum memiliki email siswa",
      };
    }

    const { user, error: userError } = await createUser(
      {
        email: registration.emailMurid,
        password: input.password,
        name: registration.namaLengkap,
        role: "STUDENT",
        phone: registration.noHpMurid,
      },
      createdById,
    );

    if (userError || !user) {
      return { student: null, error: userError || "Gagal membuat akun user" };
    }

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        pendaftaranId: registration.id,
        nis: input.nis,
        nisn: registration.nisn,
        programKeahlian: registration.programKeahlian,
        angkatan: input.angkatan,
      },
    });

    return { student, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return { student: null, error: message };
  }
}

/**
 * Get student profile by linked User id
 */
export async function getStudentByUserId(
  userId: string,
): Promise<Student | null> {
  return prisma.student.findUnique({ where: { userId } });
}
