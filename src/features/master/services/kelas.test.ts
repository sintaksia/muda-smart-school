import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createKelas, updateKelas, deleteKelas } from "./kelas";
import type { Kelas } from "@prisma/client";
import type { KelasInput } from "../types";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    kelas: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const input: KelasInput = {
  nama: "X PPLG 1",
  tingkat: 10,
  programKeahlian: "PEMROGRAMAN_PERANGKAT_LUNAK_DAN_GIM",
  tahunAjaran: "2026/2027",
  waliKelasId: "guru-1",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createKelas", () => {
  it("creates a class", async () => {
    vi.mocked(prisma.kelas.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.kelas.create).mockResolvedValue({ id: "k1" } as Kelas);

    const result = await createKelas(input);

    expect(result.error).toBeNull();
    expect(result.kelas?.id).toBe("k1");
  });

  it("rejects duplicate nama + tahun ajaran", async () => {
    vi.mocked(prisma.kelas.findUnique).mockResolvedValue({
      id: "existing",
    } as Kelas);

    const result = await createKelas(input);

    expect(result.kelas).toBeNull();
    expect(result.error).toBe(
      "Kelas dengan nama dan tahun ajaran ini sudah ada",
    );
    expect(prisma.kelas.create).not.toHaveBeenCalled();
  });
});

describe("updateKelas", () => {
  it("errors for a missing class", async () => {
    vi.mocked(prisma.kelas.findUnique).mockResolvedValue(null);
    const result = await updateKelas("missing", input);
    expect(result.error).toBe("Kelas tidak ditemukan");
  });
});

describe("deleteKelas", () => {
  it("refuses to delete a class with students or schedule", async () => {
    vi.mocked(prisma.kelas.findUnique).mockResolvedValue({
      id: "k1",
      _count: { students: 5, jadwal: 0 },
    } as unknown as Kelas);

    const result = await deleteKelas("k1");

    expect(result.ok).toBe(false);
    expect(prisma.kelas.delete).not.toHaveBeenCalled();
  });

  it("deletes an unused class", async () => {
    vi.mocked(prisma.kelas.findUnique).mockResolvedValue({
      id: "k1",
      _count: { students: 0, jadwal: 0 },
    } as unknown as Kelas);

    const result = await deleteKelas("k1");

    expect(result.ok).toBe(true);
    expect(prisma.kelas.delete).toHaveBeenCalledWith({ where: { id: "k1" } });
  });
});
