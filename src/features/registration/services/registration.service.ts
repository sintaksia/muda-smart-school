import { prisma } from "@/src/lib/prisma";
import type {
  Pendaftaran,
  Student,
  JenisKelamin,
  ProgramKeahlian,
  Pendidikan,
  StatusPendaftaran,
} from "@prisma/client";
import type { RegistrasiFormData } from "./registration.schema";

// Re-export types
export type { Pendaftaran };
export type PendaftaranWithStudent = Pendaftaran & { student: Student | null };

// ======================
// 1. INTERFACE FOR CREATE
// ======================

export interface CreateRegistrationInput {
  // Data Pribadi
  namaLengkap: string;
  jenisKelamin: JenisKelamin;
  programKeahlian: ProgramKeahlian;
  nisn: string;
  nik: string;
  nomorKk: string;
  tempatLahir: string;
  tanggalLahir: Date;

  // Kontak
  noHpMurid: string;
  emailMurid?: string;

  // Alamat
  alamatJalan: string;
  rt: string;
  rw: string;
  kelurahanDesa: string;
  kecamatan: string;
  kotaKabupaten: string;
  provinsi: string;
  kodePos?: string;

  // Data Ayah
  namaAyah: string;
  tahunLahirAyah: number;
  pendidikanAyah: Pendidikan;
  pekerjaanAyah: string;
  noTelpAyah?: string;

  // Data Ibu
  namaIbu: string;
  tahunLahirIbu: number;
  pendidikanIbu: Pendidikan;
  pekerjaanIbu: string;
  noTelpIbu?: string;

  // Data Wali (Opsional)
  namaWali?: string;
  tahunLahirWali?: number;
  pendidikanWali?: Pendidikan;
  pekerjaanWali?: string;
  noTelpWali?: string;
  hubunganWali?: string;

  // Sekolah Asal
  namaAsalSekolah: string;
  npsnAsalSekolah: string;
  alamatAsalSekolah: string;
  tahunLulus: number;
}

// ======================
// 2. READ OPERATIONS
// ======================

export async function getAllRegistrations() {
  return prisma.pendaftaran.findMany({
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRegistrationById(id: string) {
  return prisma.pendaftaran.findUnique({
    where: { id },
    include: { student: true },
  });
}

// ======================
// 3. CREATE OPERATION
// ======================

export async function createRegistration(data: CreateRegistrationInput) {
  // 1. Cek duplikasi
  const existing = await prisma.pendaftaran.findFirst({
    where: {
      OR: [{ nisn: data.nisn }, { nik: data.nik }],
    },
  });

  if (existing) {
    throw new Error("NISN atau NIK sudah terdaftar");
  }

  // 2. Generate nomor pendaftaran
  const currentYear = new Date().getFullYear().toString();

  // Cari nomor terakhir tahun ini
  const lastRegistration = await prisma.pendaftaran.findFirst({
    where: {
      nomorPendaftaran: {
        startsWith: `SPMB-${currentYear}-`,
      },
    },
    orderBy: {
      nomorPendaftaran: "desc",
    },
  });

  let sequenceNumber = 1;
  if (lastRegistration?.nomorPendaftaran) {
    const lastNumber = parseInt(
      lastRegistration.nomorPendaftaran.split("-")[2],
    );
    sequenceNumber = lastNumber + 1;
  }

  const nomorPendaftaran = `SPMB-${currentYear}-${sequenceNumber.toString().padStart(3, "0")}`;

  // 3. Create dengan nomor pendaftaran
  return prisma.pendaftaran.create({
    data: {
      ...data,
      nomorPendaftaran,
    },
  });
}

// ======================
// 4. HELPER: Convert Zod to Prisma
// ======================

export function convertZodToPrisma(
  data: RegistrasiFormData,
): CreateRegistrationInput {
  // Helper untuk konversi string ke number
  const toNumber = (val: string | undefined): number | undefined => {
    if (!val || val.trim() === "") return undefined;
    const num = parseInt(val);
    return isNaN(num) ? undefined : num;
  };

  return {
    // Data Pribadi
    namaLengkap: data.namaLengkap,
    jenisKelamin: data.jenisKelamin,
    programKeahlian: data.programKeahlian,
    nisn: data.nisn,
    nik: data.nik,
    nomorKk: data.nomorKk,
    tempatLahir: data.tempatLahir,
    tanggalLahir: new Date(data.tanggalLahir),

    // Kontak
    noHpMurid: data.noHpMurid,
    emailMurid: data.emailMurid || undefined,

    // Alamat
    alamatJalan: data.alamatJalan,
    rt: data.rt,
    rw: data.rw,
    kelurahanDesa: data.kelurahanDesa,
    kecamatan: data.kecamatan,
    kotaKabupaten: data.kotaKabupaten,
    provinsi: data.provinsi,
    kodePos: data.kodePos || undefined,

    // Data Ayah
    namaAyah: data.namaAyah,
    tahunLahirAyah: toNumber(data.tahunLahirAyah)!,
    pendidikanAyah: data.pendidikanAyah,
    pekerjaanAyah: data.pekerjaanAyah,
    noTelpAyah: data.noTelpAyah || undefined,

    // Data Ibu
    namaIbu: data.namaIbu,
    tahunLahirIbu: toNumber(data.tahunLahirIbu)!,
    pendidikanIbu: data.pendidikanIbu,
    pekerjaanIbu: data.pekerjaanIbu,
    noTelpIbu: data.noTelpIbu || undefined,

    // Data Wali
    namaWali: data.namaWali || undefined,
    tahunLahirWali: toNumber(data.tahunLahirWali),
    pendidikanWali: data.pendidikanWali || undefined,
    pekerjaanWali: data.pekerjaanWali || undefined,
    noTelpWali: data.noTelpWali || undefined,
    hubunganWali: data.hubunganWali || undefined,

    // Sekolah Asal
    namaAsalSekolah: data.namaAsalSekolah,
    npsnAsalSekolah: data.npsnAsalSekolah,
    alamatAsalSekolah: data.alamatAsalSekolah,
    tahunLulus: toNumber(data.tahunLulus)!,
  };
}

// ======================
// 5. UPDATE OPERATIONS
// ======================

export interface UpdateRegistrationInput {
  // Semua field opsional untuk partial update
  namaLengkap?: string;
  jenisKelamin?: JenisKelamin;
  programKeahlian?: ProgramKeahlian;
  nisn?: string;
  nik?: string;
  nomorKk?: string;
  tempatLahir?: string;
  tanggalLahir?: Date;

  // Kontak
  noHpMurid?: string;
  emailMurid?: string;
  noHpOrtu?: string;

  // Alamat
  alamatJalan?: string;
  rt?: string;
  rw?: string;
  kelurahanDesa?: string;
  kecamatan?: string;
  kotaKabupaten?: string;
  provinsi?: string;
  kodePos?: string;

  // Data Ayah
  namaAyah?: string;
  tahunLahirAyah?: number;
  pendidikanAyah?: Pendidikan;
  pekerjaanAyah?: string;
  noTelpAyah?: string;

  // Data Ibu
  namaIbu?: string;
  tahunLahirIbu?: number;
  pendidikanIbu?: Pendidikan;
  pekerjaanIbu?: string;
  noTelpIbu?: string;

  // Data Wali
  namaWali?: string;
  tahunLahirWali?: number;
  pendidikanWali?: Pendidikan;
  pekerjaanWali?: string;
  noTelpWali?: string;
  hubunganWali?: string;

  // Sekolah Asal
  namaAsalSekolah?: string;
  npsnAsalSekolah?: string;
  alamatAsalSekolah?: string;
  tahunLulus?: number;

  // Status
  status?: StatusPendaftaran;
  catatanValidasi?: string;
  divalidasiOleh?: string;
}

// Update status =
export async function updateRegistrationStatus(
  id: string,
  status: string, // Ubah dari StatusPendaftaran ke string
) {
  // Validasi status
  const validStatuses = ["PENDING", "DIVERIFIKASI", "DITOLAK", "DITERIMA"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Status ${status} tidak valid`);
  }

  // Hanya update status saja, tanpa tanggalValidasi
  // Karena field tanggalValidasi tidak ada di model
  return prisma.pendaftaran.update({
    where: { id },
    data: {
      status: status as StatusPendaftaran, // Cast ke enum
    },
  });
}

// ======================
// 6. DELETE OPERATION
// ======================

export async function deleteRegistration(id: string) {
  return prisma.pendaftaran.delete({
    where: { id },
  });
}

// Soft delete alternative (jika perlu)
export async function softDeleteRegistration(id: string) {
  return prisma.pendaftaran.update({
    where: { id },
    data: { status: "DITOLAK" as StatusPendaftaran }, // Atau tambah field isDeleted
  });
}

// ======================
// 7. UTILITY FUNCTIONS
// ======================

// Get by status (untuk filter admin)

export function isValidStatus(status: string): status is StatusPendaftaran {
  const validStatuses = [
    "PENDING",
    "DIVERIFIKASI",
    "DITOLAK",
    "DITERIMA",
  ] as const;
  return validStatuses.includes(status as StatusPendaftaran);
}

export async function getRegistrationsByStatus(status: string) {
  if (!isValidStatus(status)) {
    throw new Error(`Status "${status}" tidak valid`);
  }

  return prisma.pendaftaran.findMany({
    where: {
      status: status as StatusPendaftaran,
    },
    orderBy: { createdAt: "desc" },
  });
}

// Count statistics
export async function getRegistrationStats() {
  const [total, pending, diterima, ditolak] = await Promise.all([
    prisma.pendaftaran.count(),
    prisma.pendaftaran.count({ where: { status: "PENDING" } }),
    prisma.pendaftaran.count({ where: { status: "DITERIMA" } }),
    prisma.pendaftaran.count({ where: { status: "DITOLAK" } }),
  ]);

  return {
    total,
    pending,
    diterima,
    ditolak,
  };
}

// Search registrations
export async function searchRegistrations(query: string) {
  return prisma.pendaftaran.findMany({
    where: {
      OR: [
        { namaLengkap: { contains: query, mode: "insensitive" } },
        { nisn: { contains: query } },
        { nik: { contains: query } },
        { namaAsalSekolah: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50, // Limit results
  });
}
