import { prisma } from "@/src/lib/prisma";
import { createUser, deleteUser } from "@/src/features/auth/services/users";
import { getRegistrationById } from "@/src/features/registration/services";
import { toStudentProfile } from "../utils/registrationProfile";
import type { Student } from "@prisma/client";
import type { CreateStudentFromRegistrationInput } from "../types";

/**
 * Create a Student account (Supabase Auth + User + Student) from an
 * accepted (ACCEPTED) registration.
 */
export async function createStudentFromRegistration(
  input: CreateStudentFromRegistrationInput,
  createdById?: string,
): Promise<{ student: Student | null; error: string | null }> {
  try {
    const registration = await getRegistrationById(input.registrationId);

    if (!registration) {
      return { student: null, error: "Pendaftaran tidak ditemukan" };
    }

    if (registration.status !== "ACCEPTED") {
      return {
        student: null,
        error: "Pendaftaran belum diterima (status harus ACCEPTED)",
      };
    }

    if (registration.student) {
      return {
        student: null,
        error: "Akun siswa sudah pernah dibuat untuk pendaftaran ini",
      };
    }

    const email = input.email ?? registration.studentEmail;
    if (!email) {
      return {
        student: null,
        error: "Pendaftaran belum memiliki email siswa",
      };
    }

    const { user, error: userError } = await createUser(
      {
        email,
        password: input.password,
        name: registration.fullName,
        role: "STUDENT",
        phone: registration.studentPhone,
      },
      createdById,
    );

    if (userError || !user) {
      return { student: null, error: userError || "Gagal membuat akun user" };
    }

    try {
      const student = await prisma.student.create({
        data: {
          userId: user.id,
          registrationId: registration.id,
          nis: input.nis,
          nisn: registration.nisn,
          specialization: registration.specialization,
          angkatan: input.angkatan,
          ...toStudentProfile(registration),
        },
      });
      return { student, error: null };
    } catch (err: unknown) {
      // Never leave the auth account behind: an orphaned login holds the email
      // hostage and blocks every retry of this registration.
      await deleteUser(user.id);
      throw err;
    }
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
