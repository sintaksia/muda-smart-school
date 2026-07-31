import { describe, it, expect } from "vitest";
import { toStudentRow } from "./studentRow";
import type { StudentWithRelations } from "../services/student";

function prismaStudent(
  overrides: Partial<StudentWithRelations> = {},
): StudentWithRelations {
  return {
    id: "s1",
    userId: "u1",
    registrationId: null,
    nis: "2024001",
    nisn: "0091234567",
    specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
    angkatan: 2024,
    classId: "k1",
    status: "AKTIF",
    gender: "MALE",
    nik: null,
    birthPlace: "Bandung",
    birthDate: new Date("2009-05-01T00:00:00.000Z"),
    streetAddress: null,
    village: null,
    district: null,
    city: null,
    province: null,
    fatherName: null,
    motherName: null,
    guardianName: null,
    parentPhone: null,
    previousSchoolName: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      name: "Budi Santoso",
      email: "budi@contoh.sch.id",
      phone: "0812",
      status: "ACTIVE",
    },
    schoolClass: { id: "k1", name: "X PPLG 1" },
    ...overrides,
  } as StudentWithRelations;
}

describe("toStudentRow", () => {
  it("flattens user and class and formats the birth date for a date input", () => {
    const row = toStudentRow(prismaStudent());

    expect(row.name).toBe("Budi Santoso");
    expect(row.email).toBe("budi@contoh.sch.id");
    expect(row.className).toBe("X PPLG 1");
    expect(row.birthDate).toBe("2009-05-01");
  });

  it("keeps an unplaced student and an empty birth date as null", () => {
    const row = toStudentRow(
      prismaStudent({ schoolClass: null, classId: null, birthDate: null }),
    );

    expect(row.classId).toBeNull();
    expect(row.className).toBeNull();
    expect(row.birthDate).toBeNull();
  });
});
