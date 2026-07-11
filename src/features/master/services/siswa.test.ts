import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createUser } from "@/src/features/auth/services/users";
import {
  bulkUpdateSiswa,
  createSiswaManual,
  getSiswaDetail,
  updateSiswa,
} from "./siswa";
import type { Kelas, Student, User } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    student: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    kelas: { findUnique: vi.fn() },
    user: { update: vi.fn() },
    absensiSiswa: { groupBy: vi.fn() },
    creditScore: { findMany: vi.fn() },
    pengajuanIzin: { findMany: vi.fn() },
  },
}));

vi.mock("@/src/features/auth/services/users", () => ({
  createUser: vi.fn(),
}));

vi.mock("@/src/features/attendance/services/credit", () => ({
  getCreditTotal: vi.fn().mockResolvedValue(100),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateSiswa", () => {
  it("assigns the student to a class", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
      nis: "1001",
      nisn: "0012345678",
    } as Student);
    vi.mocked(prisma.kelas.findUnique).mockResolvedValue({
      id: "k1",
    } as Kelas);
    vi.mocked(prisma.student.update).mockResolvedValue({
      id: "s1",
      kelasId: "k1",
    } as Student);

    const result = await updateSiswa("s1", { kelasId: "k1" });

    expect(result.error).toBeNull();
    expect(result.siswa?.kelasId).toBe("k1");
  });

  it("rejects an unknown class", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
    } as Student);
    vi.mocked(prisma.kelas.findUnique).mockResolvedValue(null);

    const result = await updateSiswa("s1", { kelasId: "missing" });

    expect(result.siswa).toBeNull();
    expect(result.error).toBe("Kelas tidak ditemukan");
    expect(prisma.student.update).not.toHaveBeenCalled();
  });

  it("errors for a missing student", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);
    const result = await updateSiswa("missing", { status: "LULUS" });
    expect(result.error).toBe("Siswa tidak ditemukan");
  });

  it("rejects a NIS already used by another student", async () => {
    vi.mocked(prisma.student.findUnique)
      .mockResolvedValueOnce({ id: "s1", nis: "1001", nisn: "1" } as Student)
      .mockResolvedValueOnce({ id: "s2", nis: "2002" } as Student);

    const result = await updateSiswa("s1", { nis: "2002" });

    expect(result.siswa).toBeNull();
    expect(result.error).toBe("NIS sudah digunakan siswa lain");
    expect(prisma.student.update).not.toHaveBeenCalled();
  });

  it("updates user name and student fields together", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
      userId: "u1",
      nis: "1001",
      nisn: "0012345678",
    } as Student);
    vi.mocked(prisma.user.update).mockResolvedValue({ id: "u1" } as User);
    vi.mocked(prisma.student.update).mockResolvedValue({
      id: "s1",
      angkatan: 2026,
    } as Student);

    const result = await updateSiswa("s1", { name: "Budi", angkatan: 2026 });

    expect(result.error).toBeNull();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { name: "Budi", phone: undefined },
    });
    expect(result.siswa?.angkatan).toBe(2026);
  });
});

describe("getSiswaDetail", () => {
  it("returns null for a missing student", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);
    const result = await getSiswaDetail("missing");
    expect(result).toBeNull();
  });

  it("aggregates profile, attendance, credit, and izin data", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
    } as Student);
    vi.mocked(prisma.absensiSiswa.groupBy).mockResolvedValue([
      { status: "HADIR", _count: 10 },
    ] as never);
    vi.mocked(prisma.creditScore.findMany).mockResolvedValue([]);
    vi.mocked(prisma.pengajuanIzin.findMany).mockResolvedValue([]);

    const result = await getSiswaDetail("s1");

    expect(result?.siswa.id).toBe("s1");
    expect(result?.absensiSummary).toEqual([{ status: "HADIR", _count: 10 }]);
    expect(result?.creditTotal).toBe(100);
    expect(result?.izinHistory).toEqual([]);
  });
});

describe("createSiswaManual", () => {
  const input = {
    name: "Siti",
    email: "siti@example.com",
    password: "rahasia123",
    nis: "1001",
    nisn: "0012345678",
    programKeahlian: "TEKNIK_OTOMOTIF" as const,
    angkatan: 2026,
  };

  it("creates auth user and student without pendaftaran", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);
    vi.mocked(createUser).mockResolvedValue({
      user: { id: "u1" } as User,
      error: null,
    });
    vi.mocked(prisma.student.create).mockResolvedValue({
      id: "s1",
      pendaftaranId: null,
    } as Student);

    const result = await createSiswaManual(input, "admin1");

    expect(result.error).toBeNull();
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: input.email, role: "STUDENT" }),
      "admin1",
    );
    expect(prisma.student.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: "u1", pendaftaranId: null }),
    });
  });

  it("rejects a duplicate NIS", async () => {
    vi.mocked(prisma.student.findUnique)
      .mockResolvedValueOnce({ id: "other" } as Student)
      .mockResolvedValueOnce(null);

    const result = await createSiswaManual(input);

    expect(result.student).toBeNull();
    expect(result.error).toBe("NIS sudah digunakan siswa lain");
    expect(createUser).not.toHaveBeenCalled();
  });

  it("propagates a createUser failure", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);
    vi.mocked(createUser).mockResolvedValue({
      user: null,
      error: "Email sudah terdaftar",
    });

    const result = await createSiswaManual(input);

    expect(result.student).toBeNull();
    expect(result.error).toBe("Email sudah terdaftar");
    expect(prisma.student.create).not.toHaveBeenCalled();
  });
});

describe("bulkUpdateSiswa", () => {
  it("promotes students to the target class", async () => {
    vi.mocked(prisma.kelas.findUnique).mockResolvedValue({
      id: "k2",
    } as Kelas);
    vi.mocked(prisma.student.updateMany).mockResolvedValue({ count: 2 });

    const result = await bulkUpdateSiswa({
      action: "PROMOTE",
      studentIds: ["s1", "s2"],
      targetKelasId: "k2",
    });

    expect(result.error).toBeNull();
    expect(result.count).toBe(2);
    expect(prisma.student.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["s1", "s2"] } },
      data: { kelasId: "k2" },
    });
  });

  it("graduates students while keeping their class", async () => {
    vi.mocked(prisma.student.updateMany).mockResolvedValue({ count: 3 });

    const result = await bulkUpdateSiswa({
      action: "GRADUATE",
      studentIds: ["s1", "s2", "s3"],
    });

    expect(result.count).toBe(3);
    expect(prisma.student.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["s1", "s2", "s3"] } },
      data: { status: "LULUS" },
    });
  });

  it("rejects an empty selection", async () => {
    const result = await bulkUpdateSiswa({
      action: "GRADUATE",
      studentIds: [],
    });
    expect(result.error).toBe("Tidak ada siswa yang dipilih");
    expect(prisma.student.updateMany).not.toHaveBeenCalled();
  });

  it("requires a target class for promotion", async () => {
    const result = await bulkUpdateSiswa({
      action: "PROMOTE",
      studentIds: ["s1"],
    });
    expect(result.error).toBe("Kelas tujuan wajib dipilih");
  });
});
