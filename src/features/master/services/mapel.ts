import { prisma } from "@/src/lib/prisma";
import type { Subject } from "@prisma/client";
import type { SubjectInput } from "../types";

export async function getMapelList() {
  return prisma.subject.findMany({
    include: { _count: { select: { teacherSubjects: true, jadwal: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createMapel(
  input: SubjectInput,
): Promise<{ mapel: Subject | null; error: string | null }> {
  const existing = await prisma.subject.findUnique({
    where: { code: input.code },
  });
  if (existing) {
    return { mapel: null, error: "Kode mapel sudah digunakan" };
  }
  const mapel = await prisma.subject.create({ data: input });
  return { mapel, error: null };
}

export async function updateMapel(
  id: string,
  input: SubjectInput,
): Promise<{ mapel: Subject | null; error: string | null }> {
  const existing = await prisma.subject.findUnique({ where: { id } });
  if (!existing) {
    return { mapel: null, error: "Mapel tidak ditemukan" };
  }
  const duplicate = await prisma.subject.findUnique({
    where: { code: input.code },
  });
  if (duplicate && duplicate.id !== id) {
    return { mapel: null, error: "Kode mapel sudah digunakan" };
  }
  const mapel = await prisma.subject.update({
    where: { id },
    data: input,
  });
  return { mapel, error: null };
}

export async function deleteMapel(
  id: string,
): Promise<{ ok: boolean; error: string | null }> {
  const usage = await prisma.subject.findUnique({
    where: { id },
    include: { _count: { select: { teacherSubjects: true, jadwal: true } } },
  });
  if (!usage) {
    return { ok: false, error: "Mapel tidak ditemukan" };
  }
  if (usage._count.jadwal > 0) {
    return {
      ok: false,
      error: "Mapel masih dipakai di jadwal — tidak dapat dihapus",
    };
  }
  await prisma.teacherSubject.deleteMany({ where: { subjectId: id } });
  await prisma.subject.delete({ where: { id } });
  return { ok: true, error: null };
}
