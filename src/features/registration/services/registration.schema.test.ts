import { describe, it, expect } from "vitest";
import { registrasiSchema, requiredFields } from "./registration.schema";

export const validRegistrasiBody = {
  namaLengkap: "Budi Santoso",
  jenisKelamin: "LAKI_LAKI",
  programKeahlian: "TEKNIK_OTOMOTIF",
  nisn: "1234567890",
  nik: "1234567890123456",
  nomorKk: "1234567890123456",
  tempatLahir: "Bandung",
  tanggalLahir: "2010-01-15",
  noHpMurid: "081234567890",
  emailMurid: "",
  alamatJalan: "Jl. Merdeka No. 1",
  rt: "01",
  rw: "02",
  kelurahanDesa: "Sukajadi",
  kecamatan: "Sukasari",
  kotaKabupaten: "Bandung",
  provinsi: "Jawa Barat",
  kodePos: "40123",
  namaAyah: "Asep Sunandar",
  tahunLahirAyah: "1980",
  pendidikanAyah: "S1",
  pekerjaanAyah: "Wiraswasta",
  noTelpAyah: "",
  namaIbu: "Siti Aminah",
  tahunLahirIbu: "1982",
  pendidikanIbu: "S1",
  pekerjaanIbu: "Ibu Rumah Tangga",
  noTelpIbu: "",
  namaWali: "",
  tahunLahirWali: "",
  pekerjaanWali: "",
  noTelpWali: "",
  hubunganWali: "",
  namaAsalSekolah: "SMP Negeri 1 Bandung",
  npsnAsalSekolah: "12345678",
  alamatAsalSekolah: "Jl. Pendidikan No. 2",
  tahunLulus: "2025",
};

describe("registrasiSchema", () => {
  it("accepts a complete valid payload", () => {
    const result = registrasiSchema.safeParse(validRegistrasiBody);
    expect(result.success).toBe(true);
  });

  it("rejects a name that is too short", () => {
    const result = registrasiSchema.safeParse({
      ...validRegistrasiBody,
      namaLengkap: "Bu",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Nama lengkap minimal 3 karakter",
      );
    }
  });

  it("rejects an invalid program keahlian enum value", () => {
    const result = registrasiSchema.safeParse({
      ...validRegistrasiBody,
      programKeahlian: "JURUSAN_PALSU",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Pilih program keahlian");
    }
  });

  it("rejects a non-numeric or wrong-length NISN", () => {
    expect(
      registrasiSchema.safeParse({ ...validRegistrasiBody, nisn: "abc" })
        .success,
    ).toBe(false);
    expect(
      registrasiSchema.safeParse({ ...validRegistrasiBody, nisn: "123" })
        .success,
    ).toBe(false);
  });

  it("rejects an empty tahun lahir ayah/ibu (required 4-digit year)", () => {
    expect(
      registrasiSchema.safeParse({
        ...validRegistrasiBody,
        tahunLahirAyah: "",
      }).success,
    ).toBe(false);
    expect(
      registrasiSchema.safeParse({
        ...validRegistrasiBody,
        tahunLahirIbu: "80",
      }).success,
    ).toBe(false);
  });

  it("allows tahun lahir wali to stay empty (optional)", () => {
    const result = registrasiSchema.safeParse({
      ...validRegistrasiBody,
      tahunLahirWali: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects tahun lulus outside the allowed range", () => {
    const result = registrasiSchema.safeParse({
      ...validRegistrasiBody,
      tahunLulus: "2010",
    });
    expect(result.success).toBe(false);
  });
});

describe("requiredFields", () => {
  it("marks core identity fields as required and wali fields as optional", () => {
    expect(requiredFields.has("namaLengkap")).toBe(true);
    expect(requiredFields.has("tahunLahirAyah")).toBe(true);
    expect(requiredFields.has("namaWali")).toBe(false);
    expect(requiredFields.has("kodePos")).toBe(false);
  });
});
