import { prisma } from "@/src/lib/prisma";
import { createUser } from "@/src/features/auth/services/users";
import { getCreditTotal } from "@/src/features/attendance/services/credit";
import type { Student } from "@prisma/client";
import type {
  BulkSiswaInput,
  CreateSiswaManualInput,
  UpdateSiswaInput,
} from "../types";

export async function getSiswaList() {
  return prisma.student.findMany({
    include: {
      user: { select: { name: true, email: true, status: true, phone: true } },
      kelas: {
        select: { id: true, nama: true, tingkat: true, tahunAjaran: true },
      },
    },
    orderBy: { nis: "asc" },
  });
}

/** Full profile for the admin detail page: biodata + activity history. */
export async function getSiswaDetail(id: string) {
  const siswa = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      pendaftaran: true,
      kelas: {
        include: {
          waliKelas: { include: { user: { select: { name: true } } } },
        },
      },
    },
  });
  if (!siswa) {
    return null;
  }

  const [absensiSummary, creditEntries, creditTotal, izinHistory] =
    await Promise.all([
      prisma.absensiSiswa.groupBy({
        by: ["status"],
        where: { studentId: id },
        _count: true,
      }),
      prisma.creditScore.findMany({
        where: { studentId: id, ownerType: "STUDENT" },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      getCreditTotal("STUDENT", id),
      prisma.pengajuanIzin.findMany({
        where: { studentId: id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

  return { siswa, absensiSummary, creditEntries, creditTotal, izinHistory };
}

/** Update student core data, class placement, status, and user name/phone. */
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
  if (input.nis && input.nis !== existing.nis) {
    const taken = await prisma.student.findUnique({
      where: { nis: input.nis },
    });
    if (taken) {
      return { siswa: null, error: "NIS sudah digunakan siswa lain" };
    }
  }
  if (input.nisn && input.nisn !== existing.nisn) {
    const taken = await prisma.student.findUnique({
      where: { nisn: input.nisn },
    });
    if (taken) {
      return { siswa: null, error: "NISN sudah digunakan siswa lain" };
    }
  }
  if (input.name !== undefined || input.phone !== undefined) {
    await prisma.user.update({
      where: { id: existing.userId },
      data: { name: input.name, phone: input.phone },
    });
  }
  const siswa = await prisma.student.update({
    where: { id },
    data: {
      kelasId: input.kelasId !== undefined ? input.kelasId || null : undefined,
      status: input.status,
      nis: input.nis,
      nisn: input.nisn,
      programKeahlian: input.programKeahlian,
      angkatan: input.angkatan,
    },
  });
  return { siswa, error: null };
}

/**
 * Manually create a student (transfer student without a PPDB registration):
 * Supabase Auth + User + Student with pendaftaranId null.
 */
export async function createSiswaManual(
  input: CreateSiswaManualInput,
  createdById?: string,
): Promise<{ student: Student | null; error: string | null }> {
  try {
    const [nisTaken, nisnTaken] = await Promise.all([
      prisma.student.findUnique({ where: { nis: input.nis } }),
      prisma.student.findUnique({ where: { nisn: input.nisn } }),
    ]);
    if (nisTaken) {
      return { student: null, error: "NIS sudah digunakan siswa lain" };
    }
    if (nisnTaken) {
      return { student: null, error: "NISN sudah digunakan siswa lain" };
    }
    if (input.kelasId) {
      const kelas = await prisma.kelas.findUnique({
        where: { id: input.kelasId },
      });
      if (!kelas) {
        return { student: null, error: "Kelas tidak ditemukan" };
      }
    }

    const { user, error: userError } = await createUser(
      {
        email: input.email,
        password: input.password,
        name: input.name,
        role: "STUDENT",
        phone: input.phone,
      },
      createdById,
    );
    if (userError || !user) {
      return { student: null, error: userError || "Gagal membuat akun user" };
    }

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        pendaftaranId: null,
        nis: input.nis,
        nisn: input.nisn,
        programKeahlian: input.programKeahlian,
        angkatan: input.angkatan,
        kelasId: input.kelasId ?? null,
        status: input.status,
      },
    });
    return { student, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return { student: null, error: message };
  }
}

/** Bulk promotion (kenaikan kelas) or graduation. Graduation keeps kelasId. */
export async function bulkUpdateSiswa(
  input: BulkSiswaInput,
): Promise<{ count: number; error: string | null }> {
  if (input.studentIds.length === 0) {
    return { count: 0, error: "Tidak ada siswa yang dipilih" };
  }
  if (input.action === "PROMOTE") {
    if (!input.targetKelasId) {
      return { count: 0, error: "Kelas tujuan wajib dipilih" };
    }
    const kelas = await prisma.kelas.findUnique({
      where: { id: input.targetKelasId },
    });
    if (!kelas) {
      return { count: 0, error: "Kelas tujuan tidak ditemukan" };
    }
    const result = await prisma.student.updateMany({
      where: { id: { in: input.studentIds } },
      data: { kelasId: input.targetKelasId },
    });
    return { count: result.count, error: null };
  }
  const result = await prisma.student.updateMany({
    where: { id: { in: input.studentIds } },
    data: { status: "LULUS" },
  });
  return { count: result.count, error: null };
}
