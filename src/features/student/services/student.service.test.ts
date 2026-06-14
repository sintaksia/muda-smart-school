import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createUser } from "@/src/features/auth/services/users";
import { getRegistrationById } from "@/src/features/registration/services";
import {
  createStudentFromRegistration,
  getStudentByUserId,
} from "./student.service";
import type { Pendaftaran, Student, User } from "@prisma/client";

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
}));

vi.mock("@/src/features/registration/services", () => ({
  getRegistrationById: vi.fn(),
}));

const baseRegistration = {
  id: "reg-1",
  namaLengkap: "John Doe",
  nisn: "1234567890",
  programKeahlian: "PPLG",
  emailMurid: "john@example.com",
  noHpMurid: "08123456789",
  status: "DITERIMA",
  student: null,
} as unknown as Pendaftaran & { student: Student | null };

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
        pendaftaranId: "reg-1",
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
      data: {
        userId: "user-1",
        pendaftaranId: "reg-1",
        nis: "999",
        nisn: "1234567890",
        programKeahlian: "PPLG",
        angkatan: 2025,
      },
    });
  });

  it("returns an error when registration is not found", async () => {
    vi.mocked(getRegistrationById).mockResolvedValue(null);

    const result = await createStudentFromRegistration({
      pendaftaranId: "missing",
      nis: "999",
      angkatan: 2025,
      password: "Password123",
    });

    expect(result.student).toBeNull();
    expect(result.error).toBe("Pendaftaran tidak ditemukan");
    expect(createUser).not.toHaveBeenCalled();
  });

  it("returns an error when registration is not DITERIMA", async () => {
    vi.mocked(getRegistrationById).mockResolvedValue({
      ...baseRegistration,
      status: "PENDING",
    } as Pendaftaran & { student: Student | null });

    const result = await createStudentFromRegistration({
      pendaftaranId: "reg-1",
      nis: "999",
      angkatan: 2025,
      password: "Password123",
    });

    expect(result.student).toBeNull();
    expect(result.error).toBe(
      "Pendaftaran belum diterima (status harus DITERIMA)",
    );
  });

  it("returns an error when a student already exists for the registration", async () => {
    vi.mocked(getRegistrationById).mockResolvedValue({
      ...baseRegistration,
      student: { id: "existing-student" } as Student,
    });

    const result = await createStudentFromRegistration({
      pendaftaranId: "reg-1",
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
      emailMurid: null,
    } as unknown as Pendaftaran & { student: Student | null });

    const result = await createStudentFromRegistration({
      pendaftaranId: "reg-1",
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
      pendaftaranId: "reg-1",
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
