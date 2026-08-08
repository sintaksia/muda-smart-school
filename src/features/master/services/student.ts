import { prisma } from "@/src/lib/prisma";
import { createUser, deleteUser } from "@/src/features/auth/services/users";
import { defaultStudentPassword } from "../utils/studentPassword";
import type { Gender, Prisma, Student } from "@prisma/client";
import type {
  CreateStudentInput,
  StudentProfileInput,
  UpdateStudentInput,
} from "../types";

const studentListInclude = {
  user: {
    select: {
      name: true,
      email: true,
      phone: true,
      status: true,
      avatar: true,
    },
  },
  schoolClass: { select: { id: true, name: true } },
} satisfies Prisma.StudentInclude;

export type StudentWithRelations = Prisma.StudentGetPayload<{
  include: typeof studentListInclude;
}>;

export async function getStudentList(): Promise<StudentWithRelations[]> {
  return prisma.student.findMany({
    include: studentListInclude,
    orderBy: { nis: "asc" },
  });
}

export async function getStudentById(
  id: string,
): Promise<StudentWithRelations | null> {
  return prisma.student.findUnique({
    where: { id },
    include: studentListInclude,
  });
}

const PROFILE_TEXT_FIELDS = [
  "nik",
  "birthPlace",
  "streetAddress",
  "village",
  "district",
  "city",
  "province",
  "fatherName",
  "motherName",
  "guardianName",
  "parentPhone",
  "previousSchoolName",
] as const;

type StudentProfileData = Partial<
  Record<(typeof PROFILE_TEXT_FIELDS)[number], string | null>
> & { gender?: Gender | null; birthDate?: Date | null };

/**
 * Map the biodata half of the input onto Prisma columns. Only keys actually
 * present on the input are emitted, so a partial PATCH never blanks fields the
 * caller did not send.
 */
function toProfileData(input: StudentProfileInput): StudentProfileData {
  const data: StudentProfileData = {};
  for (const field of PROFILE_TEXT_FIELDS) {
    if (field in input) data[field] = input[field] || null;
  }
  if ("gender" in input) data.gender = input.gender ?? null;
  if ("birthDate" in input) {
    data.birthDate = input.birthDate
      ? new Date(`${input.birthDate}T00:00:00.000Z`)
      : null;
  }
  return data;
}

/** Reject a duplicate NIS/NISN/NIK before an auth account gets created. */
async function findConflict(
  input: { nis: string; nisn: string; nik?: string | null },
  excludeId?: string,
): Promise<string | null> {
  const existing = await prisma.student.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      OR: [
        { nis: input.nis },
        { nisn: input.nisn },
        ...(input.nik ? [{ nik: input.nik }] : []),
      ],
    },
    select: { nis: true, nisn: true, nik: true },
  });
  if (!existing) return null;
  if (existing.nis === input.nis) return "NIS sudah digunakan siswa lain";
  if (existing.nisn === input.nisn) return "NISN sudah digunakan siswa lain";
  return "NIK sudah digunakan siswa lain";
}

async function assertClassExists(classId?: string | null): Promise<boolean> {
  if (!classId) return true;
  const schoolClass = await prisma.schoolClass.findUnique({
    where: { id: classId },
    select: { id: true },
  });
  return Boolean(schoolClass);
}

/**
 * Create a student that did not come through registration: Supabase Auth user
 * + User + Student, including biodata. The password defaults to the NIS rule
 * when the caller leaves it blank (always the case for imports).
 */
export async function createStudent(
  input: CreateStudentInput,
  createdById?: string,
): Promise<{ student: Student | null; error: string | null }> {
  const conflict = await findConflict(input);
  if (conflict) {
    return { student: null, error: conflict };
  }
  if (!(await assertClassExists(input.classId))) {
    return { student: null, error: "Kelas tidak ditemukan" };
  }

  const { user, error: userError } = await createUser(
    {
      email: input.email,
      password: input.password || defaultStudentPassword(input.nis),
      name: input.name,
      role: "STUDENT",
      phone: input.phone ?? undefined,
      avatar: input.avatar ?? undefined,
    },
    createdById,
  );
  if (userError || !user) {
    return { student: null, error: userError ?? "Gagal membuat akun user" };
  }

  try {
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        nis: input.nis,
        nisn: input.nisn,
        specialization: input.specialization,
        angkatan: input.angkatan,
        classId: input.classId || null,
        status: input.status ?? "AKTIF",
        ...toProfileData(input),
      },
    });
    return { student, error: null };
  } catch (err: unknown) {
    // Roll the orphaned auth account back so the email can be reused.
    await deleteUser(user.id);
    console.error("Create student error:", err);
    return { student: null, error: "Gagal menyimpan data siswa" };
  }
}

/** Update account fields, academic placement and biodata in one call. */
export async function updateStudent(
  id: string,
  input: UpdateStudentInput,
): Promise<{ student: Student | null; error: string | null }> {
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) {
    return { student: null, error: "Siswa tidak ditemukan" };
  }
  const conflict = await findConflict(
    {
      nis: input.nis ?? existing.nis,
      nisn: input.nisn ?? existing.nisn,
      nik: input.nik ?? existing.nik,
    },
    id,
  );
  if (conflict) {
    return { student: null, error: conflict };
  }
  if (!(await assertClassExists(input.classId))) {
    return { student: null, error: "Kelas tidak ditemukan" };
  }

  if (
    input.name !== undefined ||
    input.phone !== undefined ||
    input.avatar !== undefined
  ) {
    await prisma.user.update({
      where: { id: existing.userId },
      data: { name: input.name, phone: input.phone, avatar: input.avatar },
    });
  }

  const student = await prisma.student.update({
    where: { id },
    data: {
      nis: input.nis,
      nisn: input.nisn,
      specialization: input.specialization,
      angkatan: input.angkatan,
      classId: input.classId !== undefined ? input.classId || null : undefined,
      status: input.status,
      ...toProfileData(input),
    },
  });
  return { student, error: null };
}

/**
 * Hard-delete a student and their login. Blocked while attendance, credit or
 * leave records reference them — those students should be marked LULUS/PINDAH
 * instead so history stays intact.
 */
export async function deleteStudent(
  id: string,
): Promise<{ success: boolean; error: string | null }> {
  const existing = await prisma.student.findUnique({
    where: { id },
    select: {
      userId: true,
      _count: {
        select: {
          studentAttendance: true,
          creditScores: true,
          leaveRequests: true,
        },
      },
    },
  });
  if (!existing) {
    return { success: false, error: "Siswa tidak ditemukan" };
  }

  const { studentAttendance, creditScores, leaveRequests } = existing._count;
  if (studentAttendance + creditScores + leaveRequests > 0) {
    return {
      success: false,
      error:
        "Siswa sudah memiliki riwayat absensi/poin/izin. Ubah status menjadi Lulus, Pindah atau Dropout.",
    };
  }

  await prisma.student.delete({ where: { id } });
  return deleteUser(existing.userId).then(({ success, error }) => ({
    success,
    error,
  }));
}
