import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createUser } from "@/src/features/auth/services/users";
import { createGuru, updateGuru } from "./guru";
import type { Guru, User } from "@prisma/client";
import type { CreateGuruInput } from "../types";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    guru: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    guruMataPelajaran: { deleteMany: vi.fn(), createMany: vi.fn() },
  },
}));

vi.mock("@/src/features/auth/services/users", () => ({
  createUser: vi.fn(),
}));

const input: CreateGuruInput = {
  name: "Bu Sari",
  email: "sari@muda.sch.id",
  password: "Password123",
  jenisKelamin: "PEREMPUAN",
  tempatLahir: "Bandung",
  tanggalLahir: "1990-05-01",
  pendidikanTerakhir: "S1",
  statusKepegawaian: "GTY",
  mataPelajaranIds: ["m1", "m2"],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createGuru", () => {
  it("creates account, profile, and subject qualifications", async () => {
    vi.mocked(createUser).mockResolvedValue({
      user: { id: "user-1" } as User,
      error: null,
    });
    vi.mocked(prisma.guru.create).mockResolvedValue({ id: "guru-1" } as Guru);

    const result = await createGuru(input, "admin-1");

    expect(result.error).toBeNull();
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ role: "TEACHER", email: input.email }),
      "admin-1",
    );
    const createArgs = vi.mocked(prisma.guru.create).mock.calls[0][0];
    expect(createArgs.data.userId).toBe("user-1");
    expect(createArgs.data.mataPelajaran).toEqual({
      create: [{ mataPelajaranId: "m1" }, { mataPelajaranId: "m2" }],
    });
  });

  it("propagates account creation errors", async () => {
    vi.mocked(createUser).mockResolvedValue({
      user: null,
      error: "Email sudah terdaftar",
    });

    const result = await createGuru(input);

    expect(result.guru).toBeNull();
    expect(result.error).toBe("Email sudah terdaftar");
    expect(prisma.guru.create).not.toHaveBeenCalled();
  });
});

describe("updateGuru", () => {
  it("replaces subject qualifications when provided", async () => {
    vi.mocked(prisma.guru.findUnique).mockResolvedValue({
      id: "guru-1",
    } as Guru);
    vi.mocked(prisma.guru.update).mockResolvedValue({ id: "guru-1" } as Guru);

    const result = await updateGuru("guru-1", { mataPelajaranIds: ["m3"] });

    expect(result.error).toBeNull();
    expect(prisma.guruMataPelajaran.deleteMany).toHaveBeenCalledWith({
      where: { guruId: "guru-1" },
    });
    expect(prisma.guruMataPelajaran.createMany).toHaveBeenCalledWith({
      data: [{ guruId: "guru-1", mataPelajaranId: "m3" }],
    });
  });

  it("errors for a missing guru", async () => {
    vi.mocked(prisma.guru.findUnique).mockResolvedValue(null);
    const result = await updateGuru("missing", { jabatan: "Wakasek" });
    expect(result.error).toBe("Guru tidak ditemukan");
  });
});
