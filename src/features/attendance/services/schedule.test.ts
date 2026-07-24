import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { validateJadwal, createJadwal, updateJadwal } from "./schedule";
import { getAttendanceSettings } from "./settings";
import type { AttendanceSettings } from "../types";
import type { TeacherSubject, Jadwal } from "@prisma/client";
import type { JadwalInput } from "../types";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    teacherSubject: { findUnique: vi.fn() },
    jadwal: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("./settings", () => ({ getAttendanceSettings: vi.fn() }));

const input: JadwalInput = {
  kelasId: "kelas-1",
  mataPelajaranId: "mapel-1",
  guruId: "guru-1",
  hari: "SENIN",
  jamMulai: "07:00",
  jamSelesai: "08:30",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAttendanceSettings).mockResolvedValue({
    maxWeeklyHours: 24,
  } as AttendanceSettings);
  vi.mocked(prisma.teacherSubject.findUnique).mockResolvedValue({
    id: "gmp-1",
  } as TeacherSubject);
  vi.mocked(prisma.jadwal.findMany).mockResolvedValue([]);
});

describe("validateJadwal", () => {
  it("accepts a valid entry", async () => {
    const result = await validateJadwal(input);
    expect(result).toEqual({ valid: true, errors: [], warnings: [] });
  });

  it("rejects an unqualified teacher with the specific message", async () => {
    vi.mocked(prisma.teacherSubject.findUnique).mockResolvedValue(null);
    const result = await validateJadwal(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Guru tidak terdaftar untuk mata pelajaran ini",
    );
  });

  it("detects teacher and class clashes", async () => {
    vi.mocked(prisma.jadwal.findMany)
      .mockResolvedValueOnce([
        {
          id: "j2",
          guruId: "guru-1",
          kelasId: "other",
          jamMulai: "08:00",
          jamSelesai: "09:00",
        },
        {
          id: "j3",
          guruId: "other-guru",
          kelasId: "kelas-1",
          jamMulai: "07:30",
          jamSelesai: "08:00",
        },
      ] as Jadwal[])
      .mockResolvedValueOnce([]);

    const result = await validateJadwal(input);

    expect(result.errors).toContain("Guru bentrok jadwal");
    expect(result.errors).toContain("Kelas bentrok jadwal");
  });

  it("warns (without blocking) when weekly hours exceed the max", async () => {
    vi.mocked(prisma.jadwal.findMany)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(
        Array.from({ length: 16 }, (_, i) => ({
          jamMulai: "07:00",
          jamSelesai: "08:30",
          id: `w${i}`,
        })) as Jadwal[],
      );

    const result = await validateJadwal(input);

    expect(result.valid).toBe(true);
    expect(result.warnings[0]).toContain("melebihi batas 24 jam");
  });

  it("rejects an end time before the start time", async () => {
    const result = await validateJadwal({
      ...input,
      jamMulai: "09:00",
      jamSelesai: "08:00",
    });
    expect(result.errors).toContain("Jam selesai harus setelah jam mulai");
  });
});

describe("createJadwal", () => {
  it("creates when valid", async () => {
    vi.mocked(prisma.jadwal.create).mockResolvedValue({ id: "j1" } as Jadwal);
    const result = await createJadwal(input);
    expect(result.jadwal?.id).toBe("j1");
  });

  it("returns errors without creating when invalid", async () => {
    vi.mocked(prisma.teacherSubject.findUnique).mockResolvedValue(null);
    const result = await createJadwal(input);
    expect(result.jadwal).toBeNull();
    expect(prisma.jadwal.create).not.toHaveBeenCalled();
  });
});

describe("updateJadwal", () => {
  it("versions the entry: deactivates the old row and creates a new one", async () => {
    vi.mocked(prisma.jadwal.findUnique).mockResolvedValue({
      id: "j1",
      isActive: true,
    } as Jadwal);
    vi.mocked(prisma.$transaction).mockResolvedValue([
      { id: "j1", isActive: false },
      { id: "j2" },
    ]);

    const result = await updateJadwal("j1", input);

    expect(result.jadwal?.id).toBe("j2");
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("errors for a missing or inactive entry", async () => {
    vi.mocked(prisma.jadwal.findUnique).mockResolvedValue(null);
    const result = await updateJadwal("missing", input);
    expect(result.errors).toContain("Jadwal tidak ditemukan");
  });
});
