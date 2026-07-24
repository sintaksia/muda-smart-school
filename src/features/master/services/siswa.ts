import { prisma } from "@/src/lib/prisma";
import type { Student } from "@prisma/client";
import type { UpdateStudentInput } from "../types";

export async function getSiswaList() {
  return prisma.student.findMany({
    include: {
      user: { select: { name: true, email: true, status: true } },
      schoolClass: { select: { id: true, name: true } },
    },
    orderBy: { nis: "asc" },
  });
}

/** Assign a student to a class and/or change their status. */
export async function updateSiswa(
  id: string,
  input: UpdateStudentInput,
): Promise<{ siswa: Student | null; error: string | null }> {
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) {
    return { siswa: null, error: "Siswa tidak ditemukan" };
  }
  if (input.classId) {
    const kelas = await prisma.schoolClass.findUnique({
      where: { id: input.classId },
    });
    if (!kelas) {
      return { siswa: null, error: "Kelas tidak ditemukan" };
    }
  }
  const siswa = await prisma.student.update({
    where: { id },
    data: {
      classId: input.classId !== undefined ? input.classId || null : undefined,
      status: input.status,
    },
  });
  return { siswa, error: null };
}
