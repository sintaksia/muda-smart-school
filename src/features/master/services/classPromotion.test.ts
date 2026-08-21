import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import {
  executePromotion,
  getPromotionBatches,
  getPromotionPreview,
  revertPromotion,
} from "./classPromotion";
import type { PromotionEntryInput } from "../types";

const tx = {
  promotionBatch: { create: vi.fn(), update: vi.fn() },
  studentClassHistory: { createMany: vi.fn(), deleteMany: vi.fn() },
  student: { updateMany: vi.fn() },
  schoolSetting: { upsert: vi.fn() },
};

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    schoolClass: { findMany: vi.fn() },
    student: { findMany: vi.fn() },
    studentClassHistory: { findMany: vi.fn() },
    promotionBatch: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

function sourceClass(overrides: Record<string, unknown> = {}) {
  return {
    id: "c10",
    name: "X PPLG 1",
    gradeLevel: 10,
    specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
    students: [{ id: "s1", nis: "20261", user: { name: "Dadan" } }],
    ...overrides,
  };
}

function activeStudent(overrides: Record<string, unknown> = {}) {
  return {
    id: "s1",
    classId: "c10",
    status: "ACTIVE",
    user: { name: "Dadan" },
    schoolClass: { academicYear: "2025/2026" },
    ...overrides,
  };
}

function entry(overrides: Partial<PromotionEntryInput> = {}): PromotionEntryInput {
  return { studentId: "s1", action: "PROMOTE", targetClassId: "c11", ...overrides };
}

/** Wire the three parallel reads executePromotion does, in order. */
function mockExecuteReads(options: {
  students?: unknown[];
  targetClasses?: unknown[];
  existingHistories?: unknown[];
} = {}) {
  vi.mocked(prisma.student.findMany).mockResolvedValue(
    (options.students ?? [activeStudent()]) as never,
  );
  vi.mocked(prisma.schoolClass.findMany).mockResolvedValue(
    (options.targetClasses ?? [{ id: "c11" }]) as never,
  );
  vi.mocked(prisma.studentClassHistory.findMany).mockResolvedValue(
    (options.existingHistories ?? []) as never,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  tx.promotionBatch.create.mockResolvedValue({ id: "batch-1" });
  vi.mocked(prisma.$transaction).mockImplementation(
    async (callback: unknown) =>
      (callback as (client: typeof tx) => Promise<unknown>)(tx),
  );
});

describe("getPromotionPreview", () => {
  it("suggests the matching class one grade up and lists unplaced students", async () => {
    vi.mocked(prisma.schoolClass.findMany)
      .mockResolvedValueOnce([sourceClass()] as never)
      .mockResolvedValueOnce([
        { id: "c11b", name: "XI PPLG 2", gradeLevel: 11, specialization: "SOFTWARE_AND_GAME_DEVELOPMENT" },
        { id: "c11a", name: "XI PPLG 1", gradeLevel: 11, specialization: "SOFTWARE_AND_GAME_DEVELOPMENT" },
      ] as never);
    vi.mocked(prisma.student.findMany).mockResolvedValue([
      { id: "s9", nis: "20269", user: { name: "Yuni" } },
    ] as never);

    const preview = await getPromotionPreview("2025/2026", "2026/2027");

    expect(preview.classes[0].suggestedClassId).toBe("c11a");
    expect(preview.classes[0].students[0].defaultAction).toBe("PROMOTE");
    expect(preview.unplacedStudents).toEqual([
      { studentId: "s9", name: "Yuni", nis: "20269" },
    ]);
  });

  it("marks a final-grade class as graduating with no destination", async () => {
    vi.mocked(prisma.schoolClass.findMany)
      .mockResolvedValueOnce([
        sourceClass({ id: "c12", name: "XII PPLG 1", gradeLevel: 12 }),
      ] as never)
      .mockResolvedValueOnce([] as never);
    vi.mocked(prisma.student.findMany).mockResolvedValue([] as never);

    const preview = await getPromotionPreview("2025/2026", "2026/2027");

    expect(preview.classes[0].targetGradeLevel).toBeNull();
    expect(preview.classes[0].suggestedClassId).toBeNull();
    expect(preview.classes[0].students[0].defaultAction).toBe("GRADUATE");
  });
});

describe("executePromotion", () => {
  const input = {
    fromAcademicYear: "2025/2026",
    toAcademicYear: "2026/2027",
    entries: [entry()],
  };

  it("moves the students, records the batch and advances the active year", async () => {
    mockExecuteReads();

    const { result, error } = await executePromotion(input, "admin-1");

    expect(error).toBeNull();
    expect(result).toEqual({
      batchId: "batch-1",
      promoted: 1,
      retained: 0,
      graduated: 0,
      exited: 0,
    });
    expect(tx.student.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["s1"] } },
      data: { status: "ACTIVE", classId: "c11" },
    });
    expect(tx.schoolSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { value: "2026/2027" } }),
    );
  });

  it("groups students heading to the same class into one update", async () => {
    mockExecuteReads({
      students: [
        activeStudent(),
        activeStudent({ id: "s2", user: { name: "Rina" } }),
        activeStudent({ id: "s3", user: { name: "Budi" } }),
      ],
    });

    await executePromotion(
      {
        ...input,
        entries: [
          entry(),
          entry({ studentId: "s2" }),
          entry({ studentId: "s3", action: "GRADUATE", targetClassId: null }),
        ],
      },
      "admin-1",
    );

    expect(tx.student.updateMany).toHaveBeenCalledTimes(2);
    expect(tx.student.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["s1", "s2"] } },
      data: { status: "ACTIVE", classId: "c11" },
    });
    expect(tx.student.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["s3"] } },
      data: { status: "GRADUATED", classId: null },
    });
  });

  it("rejects the whole plan when a destination is not in the target year", async () => {
    mockExecuteReads({ targetClasses: [{ id: "c11" }] });

    const { result, error } = await executePromotion(
      { ...input, entries: [entry({ targetClassId: "c99" })] },
      "admin-1",
    );

    expect(result).toBeNull();
    expect(error).toMatch(/bukan milik tahun ajaran tujuan/);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a student who is not in a class of the source year", async () => {
    mockExecuteReads({
      students: [activeStudent({ schoolClass: { academicYear: "2024/2025" } })],
    });

    const { error } = await executePromotion(input, "admin-1");

    expect(error).toMatch(/tidak terdaftar di kelas tahun ajaran 2025\/2026/);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("refuses to run twice into the same year", async () => {
    mockExecuteReads({ existingHistories: [{ studentId: "s1" }] });

    const { error } = await executePromotion(input, "admin-1");

    expect(error).toMatch(/sudah dinaikkan ke 2026\/2027/);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a same-year plan before touching the database", async () => {
    const { error } = await executePromotion(
      { ...input, toAcademicYear: "2025/2026" },
      "admin-1",
    );

    expect(error).toMatch(/harus berbeda/);
    expect(prisma.student.findMany).not.toHaveBeenCalled();
  });
});

describe("revertPromotion", () => {
  function mockRevertReads(previous: unknown[]) {
    vi.mocked(prisma.promotionBatch.findUnique).mockResolvedValue({
      id: "batch-1",
      fromAcademicYear: "2025/2026",
      revertedAt: null,
    } as never);
    vi.mocked(prisma.promotionBatch.findFirst).mockResolvedValue({
      id: "batch-1",
    } as never);
    vi.mocked(prisma.studentClassHistory.findMany)
      .mockResolvedValueOnce([{ studentId: "s1" }] as never)
      .mockResolvedValueOnce(previous as never);
  }

  it("restores each student from the source-year history row", async () => {
    mockRevertReads([{ studentId: "s1", classId: "c10", status: "ACTIVE" }]);

    const { ok, error } = await revertPromotion("batch-1");

    expect({ ok, error }).toEqual({ ok: true, error: null });
    expect(tx.student.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["s1"] } },
      data: { status: "ACTIVE", classId: "c10" },
    });
    expect(tx.studentClassHistory.deleteMany).toHaveBeenCalledWith({
      where: { batchId: "batch-1" },
    });
    expect(tx.schoolSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { value: "2025/2026" } }),
    );
  });

  it("refuses when the source-year history is incomplete", async () => {
    mockRevertReads([]);

    const { ok, error } = await revertPromotion("batch-1");

    expect(ok).toBe(false);
    expect(error).toMatch(/tidak lengkap/);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("refuses a batch that was already reverted", async () => {
    vi.mocked(prisma.promotionBatch.findUnique).mockResolvedValue({
      id: "batch-1",
      fromAcademicYear: "2025/2026",
      revertedAt: new Date(),
    } as never);

    const { ok, error } = await revertPromotion("batch-1");

    expect(ok).toBe(false);
    expect(error).toMatch(/sudah dibatalkan/);
  });

  it("refuses anything but the newest run", async () => {
    vi.mocked(prisma.promotionBatch.findUnique).mockResolvedValue({
      id: "batch-1",
      fromAcademicYear: "2025/2026",
      revertedAt: null,
    } as never);
    vi.mocked(prisma.promotionBatch.findFirst).mockResolvedValue({
      id: "batch-2",
    } as never);

    const { ok, error } = await revertPromotion("batch-1");

    expect(ok).toBe(false);
    expect(error).toMatch(/terakhir/);
  });

  it("reports a missing batch", async () => {
    vi.mocked(prisma.promotionBatch.findUnique).mockResolvedValue(null);

    const { ok, error } = await revertPromotion("nope");

    expect(ok).toBe(false);
    expect(error).toMatch(/tidak ditemukan/);
  });
});

describe("getPromotionBatches", () => {
  it("flattens the executor name", async () => {
    vi.mocked(prisma.promotionBatch.findMany).mockResolvedValue([
      { id: "batch-1", executedBy: { name: "Admin" } },
    ] as never);

    const rows = await getPromotionBatches();

    expect(rows[0]).toEqual({ id: "batch-1", executedByName: "Admin" });
  });

  it("leaves the name null when the executor is gone", async () => {
    vi.mocked(prisma.promotionBatch.findMany).mockResolvedValue([
      { id: "batch-1", executedBy: null },
    ] as never);

    const rows = await getPromotionBatches();

    expect(rows[0].executedByName).toBeNull();
  });
});
