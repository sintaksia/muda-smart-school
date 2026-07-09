import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createMapel, updateMapel, deleteMapel } from "./mapel";
import type { MataPelajaran } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    mataPelajaran: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    guruMataPelajaran: { deleteMany: vi.fn() },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createMapel", () => {
  it("creates a subject", async () => {
    vi.mocked(prisma.mataPelajaran.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.mataPelajaran.create).mockResolvedValue({
      id: "m1",
    } as MataPelajaran);

    const result = await createMapel({ nama: "Matematika", kode: "MTK" });

    expect(result.error).toBeNull();
    expect(result.mapel?.id).toBe("m1");
  });

  it("rejects a duplicate kode", async () => {
    vi.mocked(prisma.mataPelajaran.findUnique).mockResolvedValue({
      id: "existing",
    } as MataPelajaran);

    const result = await createMapel({ nama: "Matematika", kode: "MTK" });

    expect(result.mapel).toBeNull();
    expect(result.error).toBe("Kode mapel sudah digunakan");
  });
});

describe("updateMapel", () => {
  it("rejects changing kode to another subject's kode", async () => {
    vi.mocked(prisma.mataPelajaran.findUnique)
      .mockResolvedValueOnce({ id: "m1" } as MataPelajaran)
      .mockResolvedValueOnce({ id: "m2" } as MataPelajaran);

    const result = await updateMapel("m1", { nama: "MTK", kode: "TAKEN" });

    expect(result.error).toBe("Kode mapel sudah digunakan");
  });
});

describe("deleteMapel", () => {
  it("refuses to delete a subject used in schedules", async () => {
    vi.mocked(prisma.mataPelajaran.findUnique).mockResolvedValue({
      id: "m1",
      _count: { guru: 2, jadwal: 3 },
    } as unknown as MataPelajaran);

    const result = await deleteMapel("m1");

    expect(result.ok).toBe(false);
    expect(prisma.mataPelajaran.delete).not.toHaveBeenCalled();
  });

  it("deletes an unscheduled subject and its qualifications", async () => {
    vi.mocked(prisma.mataPelajaran.findUnique).mockResolvedValue({
      id: "m1",
      _count: { guru: 2, jadwal: 0 },
    } as unknown as MataPelajaran);

    const result = await deleteMapel("m1");

    expect(result.ok).toBe(true);
    expect(prisma.guruMataPelajaran.deleteMany).toHaveBeenCalledWith({
      where: { mataPelajaranId: "m1" },
    });
  });
});
