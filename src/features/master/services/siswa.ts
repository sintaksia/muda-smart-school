import { prisma } from "@/src/lib/prisma";
import type { Student } from "@prisma/client";
import type { UpdateSiswaInput } from "../types";

export async function getSiswaList() {
  return prisma.student.findMany({
    include: {
      user: { select: { name: true, email: true, status: true } },
      kelas: { select: { id: true, nama: true } },
    },
    orderBy: { nis: "asc" },
  });
}

/** Assign a student to a class and/or change their status. */
export async function updateSiswa(
  id: string,
  input: UpdateSiswaInput,
): Promise<{ siswa: Student | null; error: string | null }> {
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) {
    return { siswa: null, error: "Siswa tidak ditemukan" };
  }
  if (input.kelasId) {
    const kelas = await prisma.kelas.findUnique({
      where: { id: input.kelasId },
    });
    if (!kelas) {
      return { siswa: null, error: "Kelas tidak ditemukan" };
    }
  }
  const siswa = await prisma.student.update({
    where: { id },
    data: {
      kelasId: input.kelasId !== undefined ? input.kelasId || null : undefined,
      status: input.status,
    },
  });
  return { siswa, error: null };
}
