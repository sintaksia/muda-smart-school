import { describe, it, expect } from "vitest";
import type { Pendaftaran } from "@prisma/client";
import {
  formatTanggal,
  formatPhoneNumber,
  getInitials,
  toDateInputValue,
  toYearString,
  registrationToFormDefaults,
} from "./registration.utils";

describe("formatTanggal", () => {
  it("formats a date in Indonesian locale", () => {
    expect(formatTanggal(new Date("2025-01-15"))).toBe("15 Januari 2025");
  });

  it("accepts a date string", () => {
    expect(formatTanggal("2025-08-17")).toBe("17 Agustus 2025");
  });
});

describe("formatPhoneNumber", () => {
  it("groups a 12-digit number", () => {
    expect(formatPhoneNumber("081234567890")).toBe("0812-3456-7890");
  });

  it("returns dash for an empty value", () => {
    expect(formatPhoneNumber("")).toBe("-");
  });
});

describe("getInitials", () => {
  it("takes the first letters of the first two words", () => {
    expect(getInitials("Budi Santoso")).toBe("BS");
  });

  it("handles a single word", () => {
    expect(getInitials("Budi")).toBe("B");
  });
});

describe("toDateInputValue", () => {
  it("converts a Date to yyyy-mm-dd", () => {
    expect(toDateInputValue(new Date("2010-01-15T00:00:00Z"))).toBe(
      "2010-01-15",
    );
  });

  it("returns empty string for null", () => {
    expect(toDateInputValue(null)).toBe("");
  });
});

describe("toYearString", () => {
  it("converts a year number to string", () => {
    expect(toYearString(1980)).toBe("1980");
  });

  it("returns empty string for null", () => {
    expect(toYearString(null)).toBe("");
  });
});

describe("registrationToFormDefaults", () => {
  const registration = {
    namaLengkap: "Budi Santoso",
    jenisKelamin: "LAKI_LAKI",
    programKeahlian: "TEKNIK_OTOMOTIF",
    nisn: "1234567890",
    nik: "1234567890123456",
    nomorKk: "1234567890123456",
    tempatLahir: "Bandung",
    tanggalLahir: new Date("2010-01-15T00:00:00Z"),
    noHpMurid: "081234567890",
    emailMurid: null,
    alamatJalan: "Jl. Merdeka No. 1",
    rt: "01",
    rw: "02",
    kelurahanDesa: "Sukajadi",
    kecamatan: "Sukasari",
    kotaKabupaten: "Bandung",
    provinsi: "Jawa Barat",
    kodePos: null,
    namaAyah: "Asep",
    tahunLahirAyah: 1980,
    pendidikanAyah: "S1",
    pekerjaanAyah: "Wiraswasta",
    noTelpAyah: null,
    namaIbu: "Siti",
    tahunLahirIbu: 1982,
    pendidikanIbu: "S1",
    pekerjaanIbu: "IRT",
    noTelpIbu: null,
    namaWali: null,
    tahunLahirWali: null,
    pendidikanWali: null,
    pekerjaanWali: null,
    noTelpWali: null,
    hubunganWali: null,
    namaAsalSekolah: "SMPN 1",
    npsnAsalSekolah: "12345678",
    alamatAsalSekolah: "Jl. Pendidikan No. 2",
    tahunLulus: 2025,
  } as unknown as Pendaftaran;

  it("maps a Pendaftaran record to form default values", () => {
    const defaults = registrationToFormDefaults(registration);

    expect(defaults.namaLengkap).toBe("Budi Santoso");
    expect(defaults.tanggalLahir).toBe("2010-01-15");
    expect(defaults.tahunLahirAyah).toBe("1980");
    expect(defaults.tahunLulus).toBe("2025");
  });

  it("converts nullable fields to empty strings for the form", () => {
    const defaults = registrationToFormDefaults(registration);

    expect(defaults.emailMurid).toBe("");
    expect(defaults.kodePos).toBe("");
    expect(defaults.namaWali).toBe("");
    expect(defaults.tahunLahirWali).toBe("");
    expect(defaults.pendidikanWali).toBeUndefined();
  });
});
