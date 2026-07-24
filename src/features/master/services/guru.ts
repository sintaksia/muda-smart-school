import { prisma } from "@/src/lib/prisma";
import { createUser } from "@/src/features/auth/services/users";
import type { Teacher } from "@prisma/client";
import type { CreateTeacherInput, UpdateTeacherInput } from "../types";

export async function getGuruList() {
  return prisma.teacher.findMany({
    include: {
      user: { select: { name: true, email: true, status: true } },
      teacherSubjects: {
        include: { subject: { select: { id: true, name: true } } },
      },
      homeroomClasses: { select: { name: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
}

/**
 * Create a teacher account (Supabase Auth + User + Teacher) with subject
 * qualifications (TeacherSubject mapping used by Process 0 validation).
 */
export async function createGuru(
  input: CreateTeacherInput,
  createdById?: string,
): Promise<{ guru: Teacher | null; error: string | null }> {
  const { user, error: userError } = await createUser(
    {
      email: input.email,
      password: input.password,
      name: input.name,
      role: "TEACHER",
      phone: input.phone,
    },
    createdById,
  );
  if (userError || !user) {
    return { guru: null, error: userError || "Gagal membuat akun user" };
  }

  const guru = await prisma.teacher.create({
    data: {
      userId: user.id,
      nip: input.nip || null,
      nuptk: input.nuptk || null,
      gender: input.gender,
      birthPlace: input.birthPlace,
      birthDate: new Date(`${input.birthDate}T00:00:00.000Z`),
      education: input.education,
      position: input.position || null,
      employmentStatus: input.employmentStatus,
      teacherSubjects: {
        create: input.subjectIds.map((subjectId) => ({
          subjectId,
        })),
      },
    },
  });
  return { guru, error: null };
}

export async function updateGuru(
  id: string,
  input: UpdateTeacherInput,
): Promise<{ guru: Teacher | null; error: string | null }> {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) {
    return { guru: null, error: "Guru tidak ditemukan" };
  }

  const guru = await prisma.teacher.update({
    where: { id },
    data: {
      nip: input.nip !== undefined ? input.nip || null : undefined,
      nuptk: input.nuptk !== undefined ? input.nuptk || null : undefined,
      position:
        input.position !== undefined ? input.position || null : undefined,
      employmentStatus: input.employmentStatus,
    },
  });

  if (input.subjectIds) {
    await prisma.teacherSubject.deleteMany({ where: { teacherId: id } });
    await prisma.teacherSubject.createMany({
      data: input.subjectIds.map((subjectId) => ({
        teacherId: id,
        subjectId,
      })),
    });
  }
  return { guru, error: null };
}
