import { prisma } from "@/src/lib/prisma";
import type { Kelas } from "@prisma/client";
import type { KelasInput } from "../types";

export async function getKelasList() {
  return prisma.kelas.findMany({
    include: {
      waliKelas: { select: { id: true, user: { select: { name: true } } } },
      _count: { select: { students: true } },
    },
    orderBy: [{ tingkat: "asc" }, { nama: "asc" }],
  });
}

export async function createKelas(
  input: KelasInput,
): Promise<{ kelas: Kelas | null; error: string | null }> {
  const existing = await prisma.kelas.findUnique({
    where: {
      nama_tahunAjaran: { nama: input.nama, tahunAjaran: input.tahunAjaran },
    },
  });
  if (existing) {
    return {
      kelas: null,
      error: "Kelas dengan nama dan tahun ajaran ini sudah ada",
    };
  }
  const kelas = await prisma.kelas.create({
    data: { ...input, waliKelasId: input.waliKelasId || null },
  });
  return { kelas, error: null };
}

export async function updateKelas(
  id: string,
  input: KelasInput,
): Promise<{ kelas: Kelas | null; error: string | null }> {
  const existing = await prisma.kelas.findUnique({ where: { id } });
  if (!existing) {
    return { kelas: null, error: "Kelas tidak ditemukan" };
  }
  const kelas = await prisma.kelas.update({
    where: { id },
    data: { ...input, waliKelasId: input.waliKelasId || null },
  });
  return { kelas, error: null };
}

export async function deleteKelas(
  id: string,
): Promise<{ ok: boolean; error: string | null }> {
  const usage = await prisma.kelas.findUnique({
    where: { id },
    include: { _count: { select: { students: true, jadwal: true } } },
  });
  if (!usage) {
    return { ok: false, error: "Kelas tidak ditemukan" };
  }
  if (usage._count.students > 0 || usage._count.jadwal > 0) {
    return {
      ok: false,
      error: "Kelas masih memiliki siswa atau jadwal — tidak dapat dihapus",
    };
  }
  await prisma.kelas.delete({ where: { id } });
  return { ok: true, error: null };
}
