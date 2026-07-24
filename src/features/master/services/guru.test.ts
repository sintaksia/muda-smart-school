import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createUser } from "@/src/features/auth/services/users";
import { createTeacher, updateTeacher } from "./guru";
import type { Teacher, User } from "@prisma/client";
import type { CreateTeacherInput } from "../types";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    teacher: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    teacherSubject: { deleteMany: vi.fn(), createMany: vi.fn() },
  },
}));

vi.mock("@/src/features/auth/services/users", () => ({
  createUser: vi.fn(),
}));

const input: CreateTeacherInput = {
  name: "Bu Sari",
  email: "sari@muda.sch.id",
  password: "Password123",
  gender: "FEMALE",
  birthPlace: "Bandung",
  birthDate: "1990-05-01",
  education: "S1",
  employmentStatus: "GTY",
  subjectIds: ["m1", "m2"],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createTeacher", () => {
  it("creates account, profile, and subject qualifications", async () => {
    vi.mocked(createUser).mockResolvedValue({
      user: { id: "user-1" } as User,
      error: null,
    });
    vi.mocked(prisma.teacher.create).mockResolvedValue({
      id: "guru-1",
    } as Teacher);

    const result = await createTeacher(input, "admin-1");

    expect(result.error).toBeNull();
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ role: "TEACHER", email: input.email }),
      "admin-1",
    );
    const createArgs = vi.mocked(prisma.teacher.create).mock.calls[0][0];
    expect(createArgs.data.userId).toBe("user-1");
    expect(createArgs.data.teacherSubjects).toEqual({
      create: [{ subjectId: "m1" }, { subjectId: "m2" }],
    });
  });

  it("propagates account creation errors", async () => {
    vi.mocked(createUser).mockResolvedValue({
      user: null,
      error: "Email sudah terdaftar",
    });

    const result = await createTeacher(input);

    expect(result.teacher).toBeNull();
    expect(result.error).toBe("Email sudah terdaftar");
    expect(prisma.teacher.create).not.toHaveBeenCalled();
  });
});

describe("updateTeacher", () => {
  it("replaces subject qualifications when provided", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue({
      id: "guru-1",
    } as Teacher);
    vi.mocked(prisma.teacher.update).mockResolvedValue({
      id: "guru-1",
    } as Teacher);

    const result = await updateTeacher("guru-1", { subjectIds: ["m3"] });

    expect(result.error).toBeNull();
    expect(prisma.teacherSubject.deleteMany).toHaveBeenCalledWith({
      where: { teacherId: "guru-1" },
    });
    expect(prisma.teacherSubject.createMany).toHaveBeenCalledWith({
      data: [{ teacherId: "guru-1", subjectId: "m3" }],
    });
  });

  it("errors for a missing guru", async () => {
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(null);
    const result = await updateTeacher("missing", { position: "Wakasek" });
    expect(result.error).toBe("Guru tidak ditemukan");
  });
});
