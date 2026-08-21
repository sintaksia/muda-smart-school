import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createUser, deleteUser } from "@/src/features/auth/services/users";
import { createStudent, deleteStudent, updateStudent } from "./student";
import type { SchoolClass, Student, User } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    student: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    schoolClass: { findUnique: vi.fn() },
    user: { update: vi.fn() },
  },
}));

vi.mock("@/src/features/auth/services/users", () => ({
  createUser: vi.fn(),
  deleteUser: vi.fn(),
}));

const createInput = {
  name: "Budi Santoso",
  email: "budi@contoh.sch.id",
  nis: "2024001",
  nisn: "0091234567",
  specialization: "SOFTWARE_AND_GAME_DEVELOPMENT" as const,
  angkatan: 2024,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.student.findFirst).mockResolvedValue(null);
});

describe("createStudent", () => {
  it("creates the login and the student, defaulting the password to the NIS rule", async () => {
    vi.mocked(createUser).mockResolvedValue({
      user: { id: "u1" } as User,
      error: null,
    });
    vi.mocked(prisma.student.create).mockResolvedValue({
      id: "s1",
    } as Student);

    const result = await createStudent(createInput, "admin1");

    expect(result.error).toBeNull();
    expect(result.student?.id).toBe("s1");
    expect(vi.mocked(createUser).mock.calls[0][0]).toMatchObject({
      role: "STUDENT",
      password: "Siswa2024001",
    });
  });

  it("rejects a duplicate NIS before creating an auth account", async () => {
    vi.mocked(prisma.student.findFirst).mockResolvedValue({
      nis: "2024001",
      nisn: "other",
      nik: null,
    } as Student);

    const result = await createStudent(createInput);

    expect(result.error).toBe("NIS sudah digunakan siswa lain");
    expect(createUser).not.toHaveBeenCalled();
  });

  it("rolls the auth account back when the student row fails to save", async () => {
    vi.mocked(createUser).mockResolvedValue({
      user: { id: "u1" } as User,
      error: null,
    });
    vi.mocked(prisma.student.create).mockRejectedValue(new Error("db down"));

    const result = await createStudent(createInput);

    expect(result.student).toBeNull();
    expect(result.error).toBe("Gagal menyimpan data siswa");
    expect(deleteUser).toHaveBeenCalledWith("u1");
  });
});

describe("updateStudent", () => {
  it("assigns the student to a class", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
      nis: "1",
      nisn: "2",
    } as Student);
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue({
      id: "k1",
    } as SchoolClass);
    vi.mocked(prisma.student.update).mockResolvedValue({
      id: "s1",
      classId: "k1",
    } as Student);

    const result = await updateStudent("s1", { classId: "k1" });

    expect(result.error).toBeNull();
    expect(result.student?.classId).toBe("k1");
  });

  it("leaves biodata untouched when the patch omits it", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
      nis: "1",
      nisn: "2",
    } as Student);
    vi.mocked(prisma.student.update).mockResolvedValue({ id: "s1" } as Student);

    await updateStudent("s1", { status: "GRADUATED" });

    const data = vi.mocked(prisma.student.update).mock.calls[0][0].data;
    expect(data).not.toHaveProperty("fatherName");
    expect(data).not.toHaveProperty("birthDate");
  });

  it("rejects an unknown class", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
      nis: "1",
      nisn: "2",
    } as Student);
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue(null);

    const result = await updateStudent("s1", { classId: "missing" });

    expect(result.student).toBeNull();
    expect(result.error).toBe("Kelas tidak ditemukan");
    expect(prisma.student.update).not.toHaveBeenCalled();
  });

  it("errors for a missing student", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);
    const result = await updateStudent("missing", { status: "GRADUATED" });
    expect(result.error).toBe("Siswa tidak ditemukan");
  });
});

describe("deleteStudent", () => {
  it("deletes the student and their login when no history exists", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      userId: "u1",
      _count: {
        studentAttendance: 0,
        creditScores: 0,
        leaveRequests: 0,
      },
    } as unknown as Student);
    vi.mocked(deleteUser).mockResolvedValue({ success: true, error: null });

    const result = await deleteStudent("s1");

    expect(result.success).toBe(true);
    expect(prisma.student.delete).toHaveBeenCalledWith({ where: { id: "s1" } });
    expect(deleteUser).toHaveBeenCalledWith("u1");
  });

  it("refuses to delete a student that already has attendance history", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      userId: "u1",
      _count: {
        studentAttendance: 12,
        creditScores: 0,
        leaveRequests: 0,
      },
    } as unknown as Student);

    const result = await deleteStudent("s1");

    expect(result.success).toBe(false);
    expect(result.error).toContain("riwayat");
    expect(prisma.student.delete).not.toHaveBeenCalled();
  });
});
