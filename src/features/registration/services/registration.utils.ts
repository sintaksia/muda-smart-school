// Utility functions untuk registration

import type { Pendaftaran } from "@prisma/client";
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
 * Konversi record Pendaftaran menjadi defaultValues form edit:
 * semua field jadi string, nilai null jadi "" (kecuali enum opsional
 * pendidikanWali yang jadi undefined agar Select tidak terisi).
 */
export function registrationToFormDefaults(
  registration: Pendaftaran,
): RegistrasiFormData {
  return {
    namaLengkap: registration.namaLengkap,
    jenisKelamin: registration.jenisKelamin,
    programKeahlian: registration.programKeahlian,
    nisn: registration.nisn,
    nik: registration.nik,
    nomorKk: registration.nomorKk,
    tempatLahir: registration.tempatLahir,
    tanggalLahir: toDateInputValue(registration.tanggalLahir),
    noHpMurid: registration.noHpMurid,
    emailMurid: registration.emailMurid || "",
    noTelpAyah: registration.noTelpAyah || "",
    noTelpIbu: registration.noTelpIbu || "",

    alamatJalan: registration.alamatJalan,
    rt: registration.rt,
    rw: registration.rw,
    kelurahanDesa: registration.kelurahanDesa,
    kecamatan: registration.kecamatan,
    kotaKabupaten: registration.kotaKabupaten,
    provinsi: registration.provinsi,
    kodePos: registration.kodePos || "",

    namaAyah: registration.namaAyah,
    tahunLahirAyah: toYearString(registration.tahunLahirAyah),
    pendidikanAyah: registration.pendidikanAyah,
    pekerjaanAyah: registration.pekerjaanAyah,

    namaIbu: registration.namaIbu,
    tahunLahirIbu: toYearString(registration.tahunLahirIbu),
    pendidikanIbu: registration.pendidikanIbu,
    pekerjaanIbu: registration.pekerjaanIbu,

    namaWali: registration.namaWali || "",
    tahunLahirWali: toYearString(registration.tahunLahirWali),
    pendidikanWali: registration.pendidikanWali || undefined,
    pekerjaanWali: registration.pekerjaanWali || "",
    noTelpWali: registration.noTelpWali || "",
    hubunganWali: registration.hubunganWali || "",

    namaAsalSekolah: registration.namaAsalSekolah,
    npsnAsalSekolah: registration.npsnAsalSekolah || "",
    alamatAsalSekolah: registration.alamatAsalSekolah,
    tahunLulus: registration.tahunLulus.toString(),
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
