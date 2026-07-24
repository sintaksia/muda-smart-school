import { describe, it, expect } from "vitest";
import { registrasiSchema, requiredFields } from "./registration.schema";

export const validRegistrasiBody = {
  fullName: "Budi Santoso",
  gender: "MALE",
  specialization: "AUTOMOTIVE_ENGINEERING",
  nisn: "1234567890",
  nik: "1234567890123456",
  familyCardNumber: "1234567890123456",
  birthPlace: "Bandung",
  birthDate: "2010-01-15",
  studentPhone: "081234567890",
  studentEmail: "",
  streetAddress: "Jl. Merdeka No. 1",
  rt: "01",
  rw: "02",
  village: "Sukajadi",
  district: "Sukasari",
  city: "Bandung",
  province: "Jawa Barat",
  postalCode: "40123",
  fatherName: "Asep Sunandar",
  fatherBirthYear: "1980",
  fatherEducation: "S1",
  fatherOccupation: "Wiraswasta",
  fatherPhone: "",
  motherName: "Siti Aminah",
  motherBirthYear: "1982",
  motherEducation: "S1",
  motherOccupation: "Ibu Rumah Tangga",
  motherPhone: "",
  guardianName: "",
  guardianBirthYear: "",
  guardianOccupation: "",
  guardianPhone: "",
  guardianRelationship: "",
  previousSchoolName: "SMP Negeri 1 Bandung",
  previousSchoolNpsn: "12345678",
  previousSchoolAddress: "Jl. Pendidikan No. 2",
  graduationYear: "2025",
};

describe("registrasiSchema", () => {
  it("accepts a complete valid payload", () => {
    const result = registrasiSchema.safeParse(validRegistrasiBody);
    expect(result.success).toBe(true);
  });

  it("rejects a name that is too short", () => {
    const result = registrasiSchema.safeParse({
      ...validRegistrasiBody,
      fullName: "Bu",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Nama lengkap minimal 3 karakter",
      );
    }
  });

  it("rejects an invalid specialization enum value", () => {
    const result = registrasiSchema.safeParse({
      ...validRegistrasiBody,
      specialization: "JURUSAN_PALSU",
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
        fatherBirthYear: "",
      }).success,
    ).toBe(false);
    expect(
      registrasiSchema.safeParse({
        ...validRegistrasiBody,
        motherBirthYear: "80",
      }).success,
    ).toBe(false);
  });

  it("allows tahun lahir wali to stay empty (optional)", () => {
    const result = registrasiSchema.safeParse({
      ...validRegistrasiBody,
      guardianBirthYear: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects tahun lulus outside the allowed range", () => {
    const result = registrasiSchema.safeParse({
      ...validRegistrasiBody,
      graduationYear: "2010",
    });
    expect(result.success).toBe(false);
  });
});

describe("requiredFields", () => {
  it("marks core identity fields as required and wali fields as optional", () => {
    expect(requiredFields.has("fullName")).toBe(true);
    expect(requiredFields.has("fatherBirthYear")).toBe(true);
    expect(requiredFields.has("guardianName")).toBe(false);
    expect(requiredFields.has("postalCode")).toBe(false);
  });
});
