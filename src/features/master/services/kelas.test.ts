import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createKelas, updateKelas, deleteKelas } from "./kelas";
import type { SchoolClass } from "@prisma/client";
import type { SchoolClassInput } from "../types";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    schoolClass: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const input: SchoolClassInput = {
  name: "X PPLG 1",
  gradeLevel: 10,
  specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
  academicYear: "2026/2027",
  homeroomTeacherId: "guru-1",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createKelas", () => {
  it("creates a class", async () => {
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.schoolClass.create).mockResolvedValue({
      id: "k1",
    } as SchoolClass);

    const result = await createKelas(input);

    expect(result.error).toBeNull();
    expect(result.kelas?.id).toBe("k1");
  });

  it("rejects duplicate nama + tahun ajaran", async () => {
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue({
      id: "existing",
    } as SchoolClass);

    const result = await createKelas(input);

    expect(result.kelas).toBeNull();
    expect(result.error).toBe(
      "Kelas dengan nama dan tahun ajaran ini sudah ada",
    );
    expect(prisma.schoolClass.create).not.toHaveBeenCalled();
  });
});

describe("updateKelas", () => {
  it("errors for a missing class", async () => {
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue(null);
    const result = await updateKelas("missing", input);
    expect(result.error).toBe("Kelas tidak ditemukan");
  });
});

describe("deleteKelas", () => {
  it("refuses to delete a class with students or schedule", async () => {
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue({
      id: "k1",
      _count: { students: 5, jadwal: 0 },
    } as unknown as SchoolClass);

    const result = await deleteKelas("k1");

    expect(result.ok).toBe(false);
    expect(prisma.schoolClass.delete).not.toHaveBeenCalled();
  });

  it("deletes an unused class", async () => {
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue({
      id: "k1",
      _count: { students: 0, jadwal: 0 },
    } as unknown as SchoolClass);

    const result = await deleteKelas("k1");

    expect(result.ok).toBe(true);
    expect(prisma.schoolClass.delete).toHaveBeenCalledWith({
      where: { id: "k1" },
    });
  });
});
