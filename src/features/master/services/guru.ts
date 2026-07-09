import { prisma } from "@/src/lib/prisma";
import { createUser } from "@/src/features/auth/services/users";
import type { Guru } from "@prisma/client";
import type { CreateGuruInput, UpdateGuruInput } from "../types";

export async function getGuruList() {
  return prisma.guru.findMany({
    include: {
      user: { select: { name: true, email: true, status: true } },
      mataPelajaran: {
        include: { mataPelajaran: { select: { id: true, nama: true } } },
      },
      kelasWali: { select: { nama: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
}

/**
 * Create a teacher account (Supabase Auth + User + Guru) with subject
 * qualifications (TeacherSubject mapping used by Process 0 validation).
 */
export async function createGuru(
  input: CreateGuruInput,
  createdById?: string,
): Promise<{ guru: Guru | null; error: string | null }> {
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

  const guru = await prisma.guru.create({
    data: {
      userId: user.id,
      nip: input.nip || null,
      nuptk: input.nuptk || null,
      jenisKelamin: input.jenisKelamin,
      tempatLahir: input.tempatLahir,
      tanggalLahir: new Date(`${input.tanggalLahir}T00:00:00.000Z`),
      pendidikanTerakhir: input.pendidikanTerakhir,
      jabatan: input.jabatan || null,
      statusKepegawaian: input.statusKepegawaian,
      mataPelajaran: {
        create: input.mataPelajaranIds.map((mataPelajaranId) => ({
          mataPelajaranId,
        })),
      },
    },
  });
  return { guru, error: null };
}

export async function updateGuru(
  id: string,
  input: UpdateGuruInput,
): Promise<{ guru: Guru | null; error: string | null }> {
  const existing = await prisma.guru.findUnique({ where: { id } });
  if (!existing) {
    return { guru: null, error: "Guru tidak ditemukan" };
  }

  const guru = await prisma.guru.update({
    where: { id },
    data: {
      nip: input.nip !== undefined ? input.nip || null : undefined,
      nuptk: input.nuptk !== undefined ? input.nuptk || null : undefined,
      jabatan: input.jabatan !== undefined ? input.jabatan || null : undefined,
      statusKepegawaian: input.statusKepegawaian,
    },
  });

  if (input.mataPelajaranIds) {
    await prisma.guruMataPelajaran.deleteMany({ where: { guruId: id } });
    await prisma.guruMataPelajaran.createMany({
      data: input.mataPelajaranIds.map((mataPelajaranId) => ({
        guruId: id,
        mataPelajaranId,
      })),
    });
  }
  return { guru, error: null };
}
