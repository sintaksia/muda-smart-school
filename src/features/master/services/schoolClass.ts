import { prisma } from "@/src/lib/prisma";
import type { SchoolClass } from "@prisma/client";
import { nextGradeLevel, renameClassForGradeLevel } from "../utils/promotion";
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

/**
 * Create next year's counterpart for every class that moves up a grade, so the
 * promotion screen has destinations to offer. Final-grade classes are skipped —
 * those students graduate rather than move on.
 *
 * The homeroom teacher comes along, which matches how a wali kelas usually
 * follows their cohort; reassigning is a normal edit afterwards. Names that
 * already exist in the destination year are left untouched, so running this
 * twice is harmless.
 */
export async function cloneClassesToAcademicYear(
  fromAcademicYear: string,
  toAcademicYear: string,
): Promise<{ created: number; skipped: number }> {
  const sources = await prisma.schoolClass.findMany({
    where: { academicYear: fromAcademicYear },
    select: {
      name: true,
      gradeLevel: true,
      specialization: true,
      homeroomTeacherId: true,
    },
    orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
  });

  const data = sources.flatMap((source) => {
    const gradeLevel = nextGradeLevel(source.gradeLevel);
    if (gradeLevel === null) {
      return [];
    }
    return [
      {
        name: renameClassForGradeLevel(source.name, source.gradeLevel, gradeLevel),
        gradeLevel,
        specialization: source.specialization,
        academicYear: toAcademicYear,
        homeroomTeacherId: source.homeroomTeacherId,
      },
    ];
  });

  if (data.length === 0) {
    return { created: 0, skipped: 0 };
  }

  // @@unique([name, academicYear]) makes skipDuplicates the "already prepared"
  // path rather than an error.
  const { count } = await prisma.schoolClass.createMany({
    data,
    skipDuplicates: true,
  });
  return { created: count, skipped: data.length - count };
}
