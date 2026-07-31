import { describe, it, expect } from "vitest";
import { toStudentProfile } from "./registrationProfile";
import type { Registration } from "@prisma/client";

function registration(overrides: Partial<Registration> = {}): Registration {
  return {
    gender: "MALE",
    nik: "3210010101090001",
    birthPlace: "Bandung",
    birthDate: new Date("2009-05-01T00:00:00.000Z"),
    streetAddress: "Jl. Merdeka No. 10",
    rt: "01",
    rw: "05",
    village: "Sukamaju",
    district: "Cibeunying",
    city: "Bandung",
    province: "Jawa Barat",
    fatherName: "Ahmad Santoso",
    motherName: "Siti Aminah",
    guardianName: null,
    fatherPhone: null,
    motherPhone: "081298765432",
    guardianPhone: "081200000000",
    previousSchoolName: "SMPN 1 Bandung",
    ...overrides,
  } as Registration;
}

describe("toStudentProfile", () => {
  it("copies the biodata and folds RT/RW into the street address", () => {
    const profile = toStudentProfile(registration());

    expect(profile.gender).toBe("MALE");
    expect(profile.birthPlace).toBe("Bandung");
    expect(profile.streetAddress).toBe("Jl. Merdeka No. 10, RT 01/RW 05");
    expect(profile.previousSchoolName).toBe("SMPN 1 Bandung");
  });

  it("falls back through father -> mother -> guardian for the parent phone", () => {
    expect(toStudentProfile(registration()).parentPhone).toBe("081298765432");
    expect(
      toStudentProfile(registration({ fatherPhone: "081211111111" }))
        .parentPhone,
    ).toBe("081211111111");
    expect(
      toStudentProfile(registration({ motherPhone: null })).parentPhone,
    ).toBe("081200000000");
  });
});
