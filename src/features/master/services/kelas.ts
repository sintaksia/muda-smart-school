import { prisma } from "@/src/lib/prisma";
import type { SchoolClass } from "@prisma/client";
import type { SchoolClassInput } from "../types";

export async function getClassList() {
  return prisma.schoolClass.findMany({
    include: {
      homeroomTeacher: {
        select: { id: true, user: { select: { name: true } } },
      },
      _count: { select: { students: true } },
    },
    orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
  });
}

export async function createClass(
  input: SchoolClassInput,
): Promise<{ schoolClass: SchoolClass | null; error: string | null }> {
  const existing = await prisma.schoolClass.findUnique({
    where: {
      name_academicYear: { name: input.name, academicYear: input.academicYear },
    },
  });
  if (existing) {
    return {
      schoolClass: null,
      error: "Kelas dengan nama dan tahun ajaran ini sudah ada",
    };
  }
  const schoolClass = await prisma.schoolClass.create({
    data: { ...input, homeroomTeacherId: input.homeroomTeacherId || null },
  });
  return { schoolClass, error: null };
}

export async function updateClass(
  id: string,
  input: SchoolClassInput,
): Promise<{ schoolClass: SchoolClass | null; error: string | null }> {
  const existing = await prisma.schoolClass.findUnique({ where: { id } });
  if (!existing) {
    return { schoolClass: null, error: "Kelas tidak ditemukan" };
  }
  const schoolClass = await prisma.schoolClass.update({
    where: { id },
    data: { ...input, homeroomTeacherId: input.homeroomTeacherId || null },
  });
  return { schoolClass, error: null };
}

export async function deleteClass(
  id: string,
): Promise<{ ok: boolean; error: string | null }> {
  const usage = await prisma.schoolClass.findUnique({
    where: { id },
    include: { _count: { select: { students: true, schedules: true } } },
  });
  if (!usage) {
    return { ok: false, error: "Kelas tidak ditemukan" };
  }
  if (usage._count.students > 0 || usage._count.schedules > 0) {
    return {
      ok: false,
      error: "Kelas masih memiliki siswa atau jadwal — tidak dapat dihapus",
    };
  }
  await prisma.schoolClass.delete({ where: { id } });
  return { ok: true, error: null };
}
