import { describe, it, expect } from "vitest";
import type { Registration } from "@prisma/client";
import {
  formatPhoneNumber,
  getInitials,
  toDateInputValue,
  toYearString,
  registrationToFormDefaults,
} from "./registration.utils";

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
    fullName: "Budi Santoso",
    gender: "MALE",
    specialization: "AUTOMOTIVE_ENGINEERING",
    nisn: "1234567890",
    nik: "1234567890123456",
    familyCardNumber: "1234567890123456",
    birthPlace: "Bandung",
    birthDate: new Date("2010-01-15T00:00:00Z"),
    studentPhone: "081234567890",
    studentEmail: null,
    streetAddress: "Jl. Merdeka No. 1",
    rt: "01",
    rw: "02",
    village: "Sukajadi",
    district: "Sukasari",
    city: "Bandung",
    province: "Jawa Barat",
    postalCode: null,
    fatherName: "Asep",
    fatherBirthYear: 1980,
    fatherEducation: "S1",
    fatherOccupation: "Wiraswasta",
    fatherPhone: null,
    motherName: "Siti",
    motherBirthYear: 1982,
    motherEducation: "S1",
    motherOccupation: "IRT",
    motherPhone: null,
    guardianName: null,
    guardianBirthYear: null,
    guardianEducation: null,
    guardianOccupation: null,
    guardianPhone: null,
    guardianRelationship: null,
    previousSchoolName: "SMPN 1",
    previousSchoolNpsn: "12345678",
    previousSchoolAddress: "Jl. Pendidikan No. 2",
    graduationYear: 2025,
  } as unknown as Registration;

  it("maps a Registration record to form default values", () => {
    const defaults = registrationToFormDefaults(registration);

    expect(defaults.fullName).toBe("Budi Santoso");
    expect(defaults.birthDate).toBe("2010-01-15");
    expect(defaults.fatherBirthYear).toBe("1980");
    expect(defaults.graduationYear).toBe("2025");
  });

  it("converts nullable fields to empty strings for the form", () => {
    const defaults = registrationToFormDefaults(registration);

    expect(defaults.studentEmail).toBe("");
    expect(defaults.postalCode).toBe("");
    expect(defaults.guardianName).toBe("");
    expect(defaults.guardianBirthYear).toBe("");
    expect(defaults.guardianEducation).toBeUndefined();
  });
});
