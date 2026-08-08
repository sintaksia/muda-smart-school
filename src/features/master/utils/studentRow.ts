import type { StudentWithRelations } from "../services/student";
import type { StudentRow } from "../types";

function toDateInput(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

/**
 * Flatten a Prisma student (with user + class) into the serialisable shape the
 * admin table, the edit form and the Excel export all consume.
 */
export function toStudentRow(student: StudentWithRelations): StudentRow {
  return {
    id: student.id,
    userId: student.userId,
    name: student.user.name,
    avatar: student.user.avatar,
    email: student.user.email,
    phone: student.user.phone,
    nis: student.nis,
    nisn: student.nisn,
    specialization: student.specialization,
    angkatan: student.angkatan,
    classId: student.schoolClass?.id ?? null,
    className: student.schoolClass?.name ?? null,
    status: student.status,
    gender: student.gender,
    nik: student.nik,
    birthPlace: student.birthPlace,
    birthDate: toDateInput(student.birthDate),
    streetAddress: student.streetAddress,
    village: student.village,
    district: student.district,
    city: student.city,
    province: student.province,
    fatherName: student.fatherName,
    motherName: student.motherName,
    guardianName: student.guardianName,
    parentPhone: student.parentPhone,
    previousSchoolName: student.previousSchoolName,
  };
}
