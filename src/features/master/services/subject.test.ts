import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createSubject, updateSubject, deleteSubject } from "./subject";
import type { Subject } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    subject: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    teacherSubject: { deleteMany: vi.fn() },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createSubject", () => {
  it("creates a subject", async () => {
    vi.mocked(prisma.subject.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.subject.create).mockResolvedValue({
      id: "m1",
    } as Subject);

    const result = await createSubject({ name: "Matematika", code: "MTK" });

    expect(result.error).toBeNull();
    expect(result.subject?.id).toBe("m1");
  });

  it("rejects a duplicate kode", async () => {
    vi.mocked(prisma.subject.findUnique).mockResolvedValue({
      id: "existing",
    } as Subject);

    const result = await createSubject({ name: "Matematika", code: "MTK" });

    expect(result.subject).toBeNull();
    expect(result.error).toBe("Kode mapel sudah digunakan");
  });
});

describe("updateSubject", () => {
  it("rejects changing kode to another subject's kode", async () => {
    vi.mocked(prisma.subject.findUnique)
      .mockResolvedValueOnce({ id: "m1" } as Subject)
      .mockResolvedValueOnce({ id: "m2" } as Subject);

    const result = await updateSubject("m1", { name: "MTK", code: "TAKEN" });

    expect(result.error).toBe("Kode mapel sudah digunakan");
  });
});

describe("deleteSubject", () => {
  it("refuses to delete a subject used in schedules", async () => {
    vi.mocked(prisma.subject.findUnique).mockResolvedValue({
      id: "m1",
      _count: { teacherSubjects: 2, schedules: 3 },
    } as unknown as Subject);

    const result = await deleteSubject("m1");

    expect(result.ok).toBe(false);
    expect(prisma.subject.delete).not.toHaveBeenCalled();
  });

  it("deletes an unscheduled subject and its qualifications", async () => {
    vi.mocked(prisma.subject.findUnique).mockResolvedValue({
      id: "m1",
      _count: { teacherSubjects: 2, schedules: 0 },
    } as unknown as Subject);

    const result = await deleteSubject("m1");

    expect(result.ok).toBe(true);
    expect(prisma.teacherSubject.deleteMany).toHaveBeenCalledWith({
      where: { subjectId: "m1" },
    });
  });
});
