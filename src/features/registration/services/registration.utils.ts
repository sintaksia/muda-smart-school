// Utility functions untuk registration

import type { Registration } from "@prisma/client";
import type { RegistrasiFormData } from "./registration.schema";

/** Konversi Date ke value input type="date" (yyyy-mm-dd). */
export function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

/** Konversi tahun (number) ke string untuk input form; null jadi "". */
export function toYearString(year: number | null): string {
  return year ? year.toString() : "";
}

/**
 * Konversi record Registration menjadi defaultValues form edit:
 * semua field jadi string, nilai null jadi "" (kecuali enum opsional
 * guardianEducation yang jadi undefined agar Select tidak terisi).
 */
export function registrationToFormDefaults(
  registration: Registration,
): RegistrasiFormData {
  return {
    fullName: registration.fullName,
    gender: registration.gender,
    specialization: registration.specialization,
    nisn: registration.nisn,
    nik: registration.nik,
    familyCardNumber: registration.familyCardNumber,
    birthPlace: registration.birthPlace,
    birthDate: toDateInputValue(registration.birthDate),
    studentPhone: registration.studentPhone,
    studentEmail: registration.studentEmail || "",
    fatherPhone: registration.fatherPhone || "",
    motherPhone: registration.motherPhone || "",

    streetAddress: registration.streetAddress,
    rt: registration.rt,
    rw: registration.rw,
    village: registration.village,
    district: registration.district,
    city: registration.city,
    province: registration.province,
    postalCode: registration.postalCode || "",

    fatherName: registration.fatherName,
    fatherBirthYear: toYearString(registration.fatherBirthYear),
    fatherEducation: registration.fatherEducation,
    fatherOccupation: registration.fatherOccupation,

    motherName: registration.motherName,
    motherBirthYear: toYearString(registration.motherBirthYear),
    motherEducation: registration.motherEducation,
    motherOccupation: registration.motherOccupation,

    guardianName: registration.guardianName || "",
    guardianBirthYear: toYearString(registration.guardianBirthYear),
    guardianEducation: registration.guardianEducation || undefined,
    guardianOccupation: registration.guardianOccupation || "",
    guardianPhone: registration.guardianPhone || "",
    guardianRelationship: registration.guardianRelationship || "",

    previousSchoolName: registration.previousSchoolName,
    previousSchoolNpsn: registration.previousSchoolNpsn || "",
    previousSchoolAddress: registration.previousSchoolAddress,
    graduationYear: registration.graduationYear.toString(),
  };
}

/** Format tanggal untuk display, mis. "15 Januari 2025". */
export function formatTanggal(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format nomor telepon 12 digit menjadi 0812-3456-7890; kosong jadi "-". */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "-";
  return phone.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
}

/** Ambil maksimal dua inisial nama untuk avatar. */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
