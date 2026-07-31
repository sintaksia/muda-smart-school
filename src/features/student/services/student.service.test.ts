import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createUser, deleteUser } from "@/src/features/auth/services/users";
import { getRegistrationById } from "@/src/features/registration/services";
import {
  createStudentFromRegistration,
  getStudentByUserId,
} from "./student.service";
import type { Registration, Student, User } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    student: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/src/features/auth/services/users", () => ({
  createUser: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock("@/src/features/registration/services", () => ({
  getRegistrationById: vi.fn(),
}));

const baseRegistration = {
  id: "reg-1",
  fullName: "John Doe",
  nisn: "1234567890",
  specialization: "PPLG",
  studentEmail: "john@example.com",
  studentPhone: "08123456789",
  status: "ACCEPTED",
  student: null,
} as unknown as Registration & { student: Student | null };

describe("createStudentFromRegistration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a student account from an accepted registration", async () => {
    vi.mocked(getRegistrationById).mockResolvedValue(baseRegistration);
    vi.mocked(createUser).mockResolvedValue({
      user: { id: "user-1" } as User,
      error: null,
    });
    vi.mocked(prisma.student.create).mockResolvedValue({
      id: "student-1",
      userId: "user-1",
    } as Student);

    const result = await createStudentFromRegistration(
      {
        registrationId: "reg-1",
        nis: "999",
        angkatan: 2025,
        password: "Password123",
      },
      "admin-1",
    );

    expect(result.error).toBeNull();
    expect(result.student).toEqual({ id: "student-1", userId: "user-1" });
    expect(createUser).toHaveBeenCalledWith(
      {
        email: "john@example.com",
        password: "Password123",
        name: "John Doe",
        role: "STUDENT",
        phone: "08123456789",
      },
      "admin-1",
    );
    expect(prisma.student.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        registrationId: "reg-1",
        nis: "999",
        nisn: "1234567890",
        specialization: "PPLG",
        angkatan: 2025,
      }),
    });
  });

  it("copies the registration biodata onto the student", async () => {
    vi.mocked(getRegistrationById).mockResolvedValue({
      ...baseRegistration,
      gender: "MALE",
      nik: "3210010101090001",
      birthPlace: "Bandung",
      birthDate: new Date("2009-05-01T00:00:00.000Z"),
      streetAddress: "Jl. Merdeka No. 10",
      rt: "01",
      rw: "05",
      fatherName: "Ahmad Santoso",
      motherName: "Siti Aminah",
      previousSchoolName: "SMPN 1 Bandung",
    } as unknown as Registration & { student: Student | null });
    vi.mocked(createUser).mockResolvedValue({
      user: { id: "user-1" } as User,
      error: null,
    });
    vi.mocked(prisma.student.create).mockResolvedValue({
      id: "student-1",
    } as Student);

    await createStudentFromRegistration({
      registrationId: "reg-1",
      nis: "999",
      angkatan: 2025,
      password: "Password123",
    });

    expect(prisma.student.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        gender: "MALE",
        birthPlace: "Bandung",
        streetAddress: "Jl. Merdeka No. 10, RT 01/RW 05",
        fatherName: "Ahmad Santoso",
        previousSchoolName: "SMPN 1 Bandung",
      }),
    });
  });

  it("deletes the auth account when the student row fails to save", async () => {
    vi.mocked(getRegistrationById).mockResolvedValue(baseRegistration);
    vi.mocked(createUser).mockResolvedValue({
      user: { id: "user-1" } as User,
      error: null,
    });
    vi.mocked(prisma.student.create).mockRejectedValue(
      new Error("Unknown argument `gender`"),
    );

    const result = await createStudentFromRegistration({
      registrationId: "reg-1",
      nis: "999",
      angkatan: 2025,
      password: "Password123",
    });

    expect(result.student).toBeNull();
    expect(result.error).toContain("gender");
    // Without this the email stays taken and every retry fails.
    expect(deleteUser).toHaveBeenCalledWith("user-1");
  });

  it("returns an error when registration is not found", async () => {
    vi.mocked(getRegistrationById).mockResolvedValue(null);

    const result = await createStudentFromRegistration({
      registrationId: "missing",
      nis: "999",
      angkatan: 2025,
      password: "Password123",
    });

    expect(result.student).toBeNull();
    expect(result.error).toBe("Pendaftaran tidak ditemukan");
    expect(createUser).not.toHaveBeenCalled();
  });

  it("returns an error when registration is not ACCEPTED", async () => {
    vi.mocked(getRegistrationById).mockResolvedValue({
      ...baseRegistration,
      status: "PENDING",
    } as Registration & { student: Student | null });

    const result = await createStudentFromRegistration({
      registrationId: "reg-1",
      nis: "999",
      angkatan: 2025,
      password: "Password123",
    });

    expect(result.student).toBeNull();
    expect(result.error).toBe(
      "Pendaftaran belum diterima (status harus ACCEPTED)",
    );
  });

  it("returns an error when a student already exists for the registration", async () => {
    vi.mocked(getRegistrationById).mockResolvedValue({
      ...baseRegistration,
      student: { id: "existing-student" } as Student,
    });

    const result = await createStudentFromRegistration({
      registrationId: "reg-1",
      nis: "999",
      angkatan: 2025,
      password: "Password123",
    });

    expect(result.student).toBeNull();
    expect(result.error).toBe(
      "Akun siswa sudah pernah dibuat untuk pendaftaran ini",
    );
  });

  it("returns an error when registration has no email", async () => {
    vi.mocked(getRegistrationById).mockResolvedValue({
      ...baseRegistration,
      studentEmail: null,
    } as unknown as Registration & { student: Student | null });

    const result = await createStudentFromRegistration({
      registrationId: "reg-1",
      nis: "999",
      angkatan: 2025,
      password: "Password123",
    });

    expect(result.student).toBeNull();
    expect(result.error).toBe("Pendaftaran belum memiliki email siswa");
  });

  it("returns an error when createUser fails", async () => {
    vi.mocked(getRegistrationById).mockResolvedValue(baseRegistration);
    vi.mocked(createUser).mockResolvedValue({
      user: null,
      error: "Email sudah terdaftar",
    });

    const result = await createStudentFromRegistration({
      registrationId: "reg-1",
      nis: "999",
      angkatan: 2025,
      password: "Password123",
    });

    expect(result.student).toBeNull();
    expect(result.error).toBe("Email sudah terdaftar");
    expect(prisma.student.create).not.toHaveBeenCalled();
  });
});

describe("getStudentByUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the student for a given user id", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "student-1",
      userId: "user-1",
    } as Student);

    const result = await getStudentByUserId("user-1");

    expect(result).toEqual({ id: "student-1", userId: "user-1" });
    expect(prisma.student.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });

  it("returns null when no student is found", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);

    const result = await getStudentByUserId("unknown-user");

    expect(result).toBeNull();
  });
});
