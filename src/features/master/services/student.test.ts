import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { updateStudent } from "./student";
import type { SchoolClass, Student } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    student: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    schoolClass: { findUnique: vi.fn() },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateStudent", () => {
  it("assigns the student to a class", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
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

  it("rejects an unknown class", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
    } as Student);
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue(null);

    const result = await updateStudent("s1", { classId: "missing" });

    expect(result.student).toBeNull();
    expect(result.error).toBe("Kelas tidak ditemukan");
    expect(prisma.student.update).not.toHaveBeenCalled();
  });

  it("errors for a missing student", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);
    const result = await updateStudent("missing", { status: "LULUS" });
    expect(result.error).toBe("Siswa tidak ditemukan");
  });
});
