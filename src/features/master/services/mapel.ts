import { prisma } from "@/src/lib/prisma";
import type { MataPelajaran } from "@prisma/client";
import type { MapelInput } from "../types";

export async function getMapelList() {
  return prisma.mataPelajaran.findMany({
    include: { _count: { select: { guru: true, jadwal: true } } },
    orderBy: { nama: "asc" },
  });
}

export async function createMapel(
  input: MapelInput,
): Promise<{ mapel: MataPelajaran | null; error: string | null }> {
  const existing = await prisma.mataPelajaran.findUnique({
    where: { kode: input.kode },
  });
  if (existing) {
    return { mapel: null, error: "Kode mapel sudah digunakan" };
  }
  const mapel = await prisma.mataPelajaran.create({ data: input });
  return { mapel, error: null };
}

export async function updateMapel(
  id: string,
  input: MapelInput,
): Promise<{ mapel: MataPelajaran | null; error: string | null }> {
  const existing = await prisma.mataPelajaran.findUnique({ where: { id } });
  if (!existing) {
    return { mapel: null, error: "Mapel tidak ditemukan" };
  }
  const duplicate = await prisma.mataPelajaran.findUnique({
    where: { kode: input.kode },
  });
  if (duplicate && duplicate.id !== id) {
    return { mapel: null, error: "Kode mapel sudah digunakan" };
  }
  const mapel = await prisma.mataPelajaran.update({
    where: { id },
    data: input,
  });
  return { mapel, error: null };
}

export async function deleteMapel(
  id: string,
): Promise<{ ok: boolean; error: string | null }> {
  const usage = await prisma.mataPelajaran.findUnique({
    where: { id },
    include: { _count: { select: { guru: true, jadwal: true } } },
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
  await prisma.guruMataPelajaran.deleteMany({ where: { mataPelajaranId: id } });
  await prisma.mataPelajaran.delete({ where: { id } });
  return { ok: true, error: null };
}
