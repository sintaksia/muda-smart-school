import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { updateSiswa } from "./siswa";
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

describe("updateSiswa", () => {
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

    const result = await updateSiswa("s1", { classId: "k1" });

    expect(result.error).toBeNull();
    expect(result.siswa?.classId).toBe("k1");
  });

  it("rejects an unknown class", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
    } as Student);
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue(null);

    const result = await updateSiswa("s1", { classId: "missing" });

    expect(result.siswa).toBeNull();
    expect(result.error).toBe("Kelas tidak ditemukan");
    expect(prisma.student.update).not.toHaveBeenCalled();
  });

  it("errors for a missing student", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);
    const result = await updateSiswa("missing", { status: "LULUS" });
    expect(result.error).toBe("Siswa tidak ditemukan");
  });
});
