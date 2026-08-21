import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import {
  cloneClassesToAcademicYear,
  createClass,
  updateClass,
  deleteClass,
} from "./schoolClass";
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
      createMany: vi.fn(),
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

describe("createClass", () => {
  it("creates a class", async () => {
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.schoolClass.create).mockResolvedValue({
      id: "k1",
    } as SchoolClass);

    const result = await createClass(input);

    expect(result.error).toBeNull();
    expect(result.schoolClass?.id).toBe("k1");
  });

  it("rejects duplicate nama + tahun ajaran", async () => {
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue({
      id: "existing",
    } as SchoolClass);

    const result = await createClass(input);

    expect(result.schoolClass).toBeNull();
    expect(result.error).toBe(
      "Kelas dengan nama dan tahun ajaran ini sudah ada",
    );
    expect(prisma.schoolClass.create).not.toHaveBeenCalled();
  });
});

describe("updateClass", () => {
  it("errors for a missing class", async () => {
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue(null);
    const result = await updateClass("missing", input);
    expect(result.error).toBe("Kelas tidak ditemukan");
  });
});

describe("deleteClass", () => {
  it("refuses to delete a class with students or schedule", async () => {
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue({
      id: "k1",
      _count: { students: 5, jadwal: 0 },
    } as unknown as SchoolClass);

    const result = await deleteClass("k1");

    expect(result.ok).toBe(false);
    expect(prisma.schoolClass.delete).not.toHaveBeenCalled();
  });

  it("deletes an unused class", async () => {
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue({
      id: "k1",
      _count: { students: 0, jadwal: 0 },
    } as unknown as SchoolClass);

    const result = await deleteClass("k1");

    expect(result.ok).toBe(true);
    expect(prisma.schoolClass.delete).toHaveBeenCalledWith({
      where: { id: "k1" },
    });
  });
});

describe("cloneClassesToAcademicYear", () => {
  it("moves each class up a grade and skips the final grade", async () => {
    vi.mocked(prisma.schoolClass.findMany).mockResolvedValue([
      {
        name: "X PPLG 1",
        gradeLevel: 10,
        specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
        homeroomTeacherId: "t1",
      },
      {
        name: "XII TKR 1",
        gradeLevel: 12,
        specialization: "AUTOMOTIVE_ENGINEERING",
        homeroomTeacherId: null,
      },
    ] as never);
    vi.mocked(prisma.schoolClass.createMany).mockResolvedValue({ count: 1 });

    const result = await cloneClassesToAcademicYear("2025/2026", "2026/2027");

    expect(result).toEqual({ created: 1, skipped: 0 });
    expect(prisma.schoolClass.createMany).toHaveBeenCalledWith({
      data: [
        {
          name: "XI PPLG 1",
          gradeLevel: 11,
          specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
          academicYear: "2026/2027",
          homeroomTeacherId: "t1",
        },
      ],
      skipDuplicates: true,
    });
  });

  it("counts names that already exist as skipped", async () => {
    vi.mocked(prisma.schoolClass.findMany).mockResolvedValue([
      {
        name: "X PPLG 1",
        gradeLevel: 10,
        specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
        homeroomTeacherId: null,
      },
    ] as never);
    vi.mocked(prisma.schoolClass.createMany).mockResolvedValue({ count: 0 });

    await expect(
      cloneClassesToAcademicYear("2025/2026", "2026/2027"),
    ).resolves.toEqual({ created: 0, skipped: 1 });
  });

  it("writes nothing when every class is already in the final grade", async () => {
    vi.mocked(prisma.schoolClass.findMany).mockResolvedValue([
      {
        name: "XII TKR 1",
        gradeLevel: 12,
        specialization: "AUTOMOTIVE_ENGINEERING",
        homeroomTeacherId: null,
      },
    ] as never);

    const result = await cloneClassesToAcademicYear("2025/2026", "2026/2027");

    expect(result).toEqual({ created: 0, skipped: 0 });
    expect(prisma.schoolClass.createMany).not.toHaveBeenCalled();
  });
});
