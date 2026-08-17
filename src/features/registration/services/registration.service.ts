import { prisma } from "@/src/lib/prisma";
import type {
  Registration,
  Student,
  Gender,
  Specialization,
  Education,
  RegistrationStatus,
} from "@prisma/client";
import type { RegistrasiFormData } from "./registration.schema";
import { REGISTRATION_STATUS_VALUES } from "@/src/lib/constants";

// Re-export types
export type { Registration };
export type RegistrationWithStudent = Registration & {
  student: Student | null;
};

// ======================
// 1. INTERFACE FOR CREATE
// ======================

export interface CreateRegistrationInput {
  // Data Pribadi
  fullName: string;
  gender: Gender;
  specialization: Specialization;
  nisn: string;
  nik: string;
  familyCardNumber: string;
  birthPlace: string;
  birthDate: Date;

  // Kontak
  studentPhone: string;
  studentEmail?: string;

  // Alamat
  streetAddress: string;
  rt: string;
  rw: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode?: string;

  // Data Ayah
  fatherName: string;
  fatherBirthYear: number;
  fatherEducation: Education;
  fatherOccupation: string;
  fatherPhone?: string;

  // Data Ibu
  motherName: string;
  motherBirthYear: number;
  motherEducation: Education;
  motherOccupation: string;
  motherPhone?: string;

  // Data Wali (Opsional)
  guardianName?: string;
  guardianBirthYear?: number;
  guardianEducation?: Education;
  guardianOccupation?: string;
  guardianPhone?: string;
  guardianRelationship?: string;

  // Sekolah Asal
  previousSchoolName: string;
  previousSchoolNpsn: string;
  previousSchoolAddress: string;
  graduationYear: number;
}

// ======================
// 2. READ OPERATIONS
// ======================

/**
 * Ambil semua pendaftaran (terbaru dulu) beserta relasi akun siswa.
 * Dipakai halaman admin — jangan diekspos tanpa auth (berisi PII).
 */
export async function getAllRegistrations() {
  return prisma.registration.findMany({
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Feed pendaftaran terbaru untuk dashboard admin.
 * Selalu dibatasi `take` — jangan tarik seluruh tabel hanya untuk di-slice.
 */
export async function getRecentRegistrations(limit = 5) {
  return prisma.registration.findMany({
    include: { student: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Ambil satu pendaftaran berdasarkan id, beserta relasi akun siswa. */
export async function getRegistrationById(id: string) {
  return prisma.registration.findUnique({
    where: { id },
    include: { student: true },
  });
}

// ======================
// 3. CREATE OPERATION
// ======================

/**
 * Buat pendaftaran baru.
 * Menolak NISN/NIK duplikat (throw) dan meng-generate nomor pendaftaran
 * berurutan per tahun dengan format `SPMB-<tahun>-<urutan 3 digit>`.
 */
export async function createRegistration(data: CreateRegistrationInput) {
  // 1. Cek duplikasi
  const existing = await prisma.registration.findFirst({
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
  const lastRegistration = await prisma.registration.findFirst({
    where: {
      registrationNumber: {
        startsWith: `SPMB-${currentYear}-`,
      },
    },
    orderBy: {
      registrationNumber: "desc",
    },
  });

  let sequenceNumber = 1;
  if (lastRegistration?.registrationNumber) {
    const lastNumber = parseInt(
      lastRegistration.registrationNumber.split("-")[2],
    );
    sequenceNumber = lastNumber + 1;
  }

  const registrationNumber = `SPMB-${currentYear}-${sequenceNumber.toString().padStart(3, "0")}`;

  // 3. Create dengan nomor pendaftaran
  return prisma.registration.create({
    data: {
      ...data,
      registrationNumber,
    },
  });
}

// ======================
// 4. HELPER: Convert Zod to Prisma
// ======================

// Helper untuk konversi string ke number
function toNumber(val: string | undefined): number | undefined {
  if (!val || val.trim() === "") return undefined;
  const num = parseInt(val);
  return isNaN(num) ? undefined : num;
}

// Untuk kolom Prisma yang wajib (Int) — gagal eksplisit, bukan NaN/undefined
function toRequiredNumber(val: string | undefined, fieldName: string): number {
  const num = toNumber(val);
  if (num === undefined) {
    throw new Error(`${fieldName} wajib diisi dengan angka`);
  }
  return num;
}

/**
 * Konversi data form (semua string) ke input create Prisma:
 * tahun jadi number, tanggal jadi Date, field opsional kosong jadi undefined.
 * Throw jika tahun wajib (ayah/ibu/lulus) tidak berisi angka.
 */
export function convertZodToPrisma(
  data: RegistrasiFormData,
): CreateRegistrationInput {
  return {
    // Data Pribadi
    fullName: data.fullName,
    gender: data.gender,
    specialization: data.specialization,
    nisn: data.nisn,
    nik: data.nik,
    familyCardNumber: data.familyCardNumber,
    birthPlace: data.birthPlace,
    birthDate: new Date(data.birthDate),

    // Kontak
    studentPhone: data.studentPhone,
    studentEmail: data.studentEmail || undefined,

    // Alamat
    streetAddress: data.streetAddress,
    rt: data.rt,
    rw: data.rw,
    village: data.village,
    district: data.district,
    city: data.city,
    province: data.province,
    postalCode: data.postalCode || undefined,

    // Data Ayah
    fatherName: data.fatherName,
    fatherBirthYear: toRequiredNumber(data.fatherBirthYear, "Tahun lahir ayah"),
    fatherEducation: data.fatherEducation,
    fatherOccupation: data.fatherOccupation,
    fatherPhone: data.fatherPhone || undefined,

    // Data Ibu
    motherName: data.motherName,
    motherBirthYear: toRequiredNumber(data.motherBirthYear, "Tahun lahir ibu"),
    motherEducation: data.motherEducation,
    motherOccupation: data.motherOccupation,
    motherPhone: data.motherPhone || undefined,

    // Data Wali
    guardianName: data.guardianName || undefined,
    guardianBirthYear: toNumber(data.guardianBirthYear),
    guardianEducation: data.guardianEducation || undefined,
    guardianOccupation: data.guardianOccupation || undefined,
    guardianPhone: data.guardianPhone || undefined,
    guardianRelationship: data.guardianRelationship || undefined,

    // Sekolah Asal
    previousSchoolName: data.previousSchoolName,
    previousSchoolNpsn: data.previousSchoolNpsn,
    previousSchoolAddress: data.previousSchoolAddress,
    graduationYear: toRequiredNumber(data.graduationYear, "Tahun lulus"),
  };
}

// Konversi data form edit menjadi input update.
// Field opsional yang dikosongkan harus tersimpan sebagai null —
// undefined akan di-skip oleh Prisma sehingga nilai lama tidak terhapus.
export function convertZodToUpdateInput(
  data: RegistrasiFormData,
): UpdateRegistrationInput {
  return {
    ...convertZodToPrisma(data),
    studentEmail: data.studentEmail || null,
    postalCode: data.postalCode || null,
    fatherPhone: data.fatherPhone || null,
    motherPhone: data.motherPhone || null,
    guardianName: data.guardianName || null,
    guardianBirthYear: toNumber(data.guardianBirthYear) ?? null,
    guardianEducation: data.guardianEducation || null,
    guardianOccupation: data.guardianOccupation || null,
    guardianPhone: data.guardianPhone || null,
    guardianRelationship: data.guardianRelationship || null,
  };
}

// ======================
// 5. UPDATE OPERATIONS
// ======================

export interface UpdateRegistrationInput {
  // Semua field opsional untuk partial update
  fullName?: string;
  gender?: Gender;
  specialization?: Specialization;
  nisn?: string;
  nik?: string;
  familyCardNumber?: string;
  birthPlace?: string;
  birthDate?: Date;

  // Kontak
  studentPhone?: string;
  studentEmail?: string | null;

  // Alamat
  streetAddress?: string;
  rt?: string;
  rw?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string | null;

  // Data Ayah
  fatherName?: string;
  fatherBirthYear?: number;
  fatherEducation?: Education;
  fatherOccupation?: string;
  fatherPhone?: string | null;

  // Data Ibu
  motherName?: string;
  motherBirthYear?: number;
  motherEducation?: Education;
  motherOccupation?: string;
  motherPhone?: string | null;

  // Data Wali
  guardianName?: string | null;
  guardianBirthYear?: number | null;
  guardianEducation?: Education | null;
  guardianOccupation?: string | null;
  guardianPhone?: string | null;
  guardianRelationship?: string | null;

  // Sekolah Asal
  previousSchoolName?: string;
  previousSchoolNpsn?: string;
  previousSchoolAddress?: string;
  graduationYear?: number;

  // Status
  status?: RegistrationStatus;
}

// Update seluruh data pendaftaran (edit)
/** Update data pendaftaran (edit penuh dari form admin). */
export async function updateRegistration(
  id: string,
  data: UpdateRegistrationInput,
) {
  return prisma.registration.update({
    where: { id },
    data,
  });
}

/**
 * Update status pendaftaran (PENDING/VERIFIED/ACCEPTED/REJECTED).
 * Menerima string agar bisa dipakai langsung dari request body;
 * throw jika status bukan nilai RegistrationStatus yang valid.
 */
export async function updateRegistrationStatus(id: string, status: string) {
  if (!isValidStatus(status)) {
    throw new Error(`Status ${status} tidak valid`);
  }

  return prisma.registration.update({
    where: { id },
    data: {
      status: status as RegistrationStatus,
    },
  });
}

// ======================
// 6. DELETE OPERATION
// ======================

/** Hapus permanen satu pendaftaran. */
export async function deleteRegistration(id: string) {
  return prisma.registration.delete({
    where: { id },
  });
}

// ======================
// 7. UTILITY FUNCTIONS
// ======================

/** Type guard: apakah string merupakan nilai RegistrationStatus yang valid. */
export function isValidStatus(status: string): status is RegistrationStatus {
  return REGISTRATION_STATUS_VALUES.includes(status as RegistrationStatus);
}

/**
 * Ambil pendaftaran yang berstatus tertentu (untuk filter admin),
 * beserta relasi akun siswa. Throw jika status tidak valid.
 */
export async function getRegistrationsByStatus(status: string) {
  if (!isValidStatus(status)) {
    throw new Error(`Status "${status}" tidak valid`);
  }

  return prisma.registration.findMany({
    where: {
      status: status as RegistrationStatus,
    },
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Hitung jumlah pendaftaran per status untuk kartu statistik admin. */
export async function getRegistrationStats() {
  const [total, pending, accepted, rejected] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { status: "PENDING" } }),
    prisma.registration.count({ where: { status: "ACCEPTED" } }),
    prisma.registration.count({ where: { status: "REJECTED" } }),
  ]);

  return {
    total,
    pending,
    accepted,
    rejected,
  };
}
