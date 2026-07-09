import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { processSessionDeductions } from "./deduction";
import { getAttendanceSettings } from "./settings";
import { createCreditEntry } from "./credit";
import type { AttendanceSettings } from "../types";
import type { PengajuanIzin, Sesi } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    sesi: { findUnique: vi.fn() },
    creditScore: { findFirst: vi.fn() },
    pengajuanIzin: { findFirst: vi.fn() },
    absensiSiswa: { create: vi.fn() },
  },
}));

vi.mock("./settings", () => ({ getAttendanceSettings: vi.fn() }));
vi.mock("./credit", () => ({ createCreditEntry: vi.fn() }));

const settings = {
  creditPoints: {
    alpaStudent: -10,
    terlambatStudent: -3,
    alpaTeacher: -15,
    terlambatTeacher: -5,
  },
} as AttendanceSettings;

const tanggal = new Date("2026-07-09T00:00:00.000Z");

function mockSesi(overrides: {
  status?: string;
  students?: { id: string }[];
  absensi?: { studentId: string; status: string }[];
}): void {
  vi.mocked(prisma.sesi.findUnique).mockResolvedValue({
    id: "sesi-1",
    jadwalId: "jadwal-1",
    tanggal,
    status: overrides.status ?? "CLOSED",
    jadwal: {
      kelas: { students: overrides.students ?? [] },
    },
    absensiSiswa: overrides.absensi ?? [],
  } as unknown as Sesi);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAttendanceSettings).mockResolvedValue(settings);
  vi.mocked(prisma.creditScore.findFirst).mockResolvedValue(null);
  vi.mocked(prisma.pengajuanIzin.findFirst).mockResolvedValue(null);
});

describe("processSessionDeductions", () => {
  it("deducts Alpa for roster students without any record", async () => {
    mockSesi({ students: [{ id: "s1" }] });

    const summary = await processSessionDeductions("sesi-1");

    expect(summary.alpa).toBe(1);
    expect(prisma.absensiSiswa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ studentId: "s1", status: "ALPHA" }),
      }),
    );
    expect(createCreditEntry).toHaveBeenCalledWith(
      expect.objectContaining({ points: -10, refSesiId: "sesi-1" }),
    );
  });

  it("deducts Terlambat and skips Hadir", async () => {
    mockSesi({
      students: [{ id: "s1" }, { id: "s2" }],
      absensi: [
        { studentId: "s1", status: "HADIR" },
        { studentId: "s2", status: "TERLAMBAT" },
      ],
    });

    const summary = await processSessionDeductions("sesi-1");

    expect(summary.terlambat).toBe(1);
    expect(summary.alpa).toBe(0);
    expect(createCreditEntry).toHaveBeenCalledTimes(1);
    expect(createCreditEntry).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: "s2", points: -3 }),
    );
  });

  it("records Izin without deduction when a pre-approved izin exists", async () => {
    mockSesi({ students: [{ id: "s1" }] });
    vi.mocked(prisma.pengajuanIzin.findFirst).mockResolvedValue({
      id: "izin-1",
      jenis: "SAKIT",
    } as PengajuanIzin);

    const summary = await processSessionDeductions("sesi-1");

    expect(summary.izinSakit).toBe(1);
    expect(summary.alpa).toBe(0);
    expect(createCreditEntry).not.toHaveBeenCalled();
    expect(prisma.absensiSiswa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "SAKIT" }),
      }),
    );
  });

  it("never deducts for KELAS_KOSONG sessions (teacher absence ≠ student penalty)", async () => {
    mockSesi({ status: "KELAS_KOSONG", students: [{ id: "s1" }] });

    const summary = await processSessionDeductions("sesi-1");

    expect(summary.processed).toBe(false);
    expect(createCreditEntry).not.toHaveBeenCalled();
    expect(prisma.absensiSiswa.create).not.toHaveBeenCalled();
  });

  it("is idempotent — re-running never duplicates deductions", async () => {
    mockSesi({
      students: [{ id: "s1" }],
      absensi: [{ studentId: "s1", status: "TERLAMBAT" }],
    });
    vi.mocked(prisma.creditScore.findFirst).mockResolvedValue({
      id: "existing",
    } as never);

    const summary = await processSessionDeductions("sesi-1");

    expect(summary.terlambat).toBe(0);
    expect(createCreditEntry).not.toHaveBeenCalled();
  });

  it("throws when the session does not exist", async () => {
    vi.mocked(prisma.sesi.findUnique).mockResolvedValue(null);
    await expect(processSessionDeductions("missing")).rejects.toThrow(
      "Sesi tidak ditemukan",
    );
  });
});
