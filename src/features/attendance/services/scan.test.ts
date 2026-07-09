import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { recordScan, markManualAttendance } from "./scan";
import { getAttendanceSettings } from "./settings";
import type { AttendanceSettings } from "../types";
import type { AbsensiSiswa, Sesi, Student } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    sesi: { findUnique: vi.fn() },
    student: { findUnique: vi.fn() },
    absensiSiswa: { findUnique: vi.fn(), create: vi.fn() },
    guru: { findUnique: vi.fn() },
    notification: { create: vi.fn() },
  },
}));

vi.mock("./settings", () => ({ getAttendanceSettings: vi.fn() }));

const settings = {
  sessionGracePeriodMinutes: 10,
  qrTokenTtlSeconds: 45,
  qrMode: "STATIC",
  gpsRadiusMeters: 100,
  gpsSchoolLat: -6.9345,
  gpsSchoolLng: 107.7223,
} as AttendanceSettings;

// Sesi on 2026-07-09 (WIB), 07:00–08:30. Grace until 07:10 WIB = 00:10 UTC.
const baseSesi = {
  id: "sesi-1",
  jadwalId: "jadwal-1",
  tanggal: new Date("2026-07-09T00:00:00.000Z"),
  status: "OPEN",
  qrTokenIssuedAt: new Date("2026-07-08T23:59:00.000Z"),
  actualGuruId: "guru-1",
  jadwal: {
    id: "jadwal-1",
    kelasId: "kelas-1",
    jamMulai: "07:00",
    jamSelesai: "08:30",
  },
} as unknown as Sesi;

const student = {
  id: "student-1",
  kelasId: "kelas-1",
} as Student;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAttendanceSettings).mockResolvedValue(settings);
  vi.mocked(prisma.sesi.findUnique).mockResolvedValue(baseSesi);
  vi.mocked(prisma.student.findUnique).mockResolvedValue(student);
  vi.mocked(prisma.absensiSiswa.findUnique).mockResolvedValue(null);
  vi.mocked(prisma.absensiSiswa.create).mockResolvedValue({} as AbsensiSiswa);
});

describe("recordScan", () => {
  const input = {
    token: "tok",
    studentUserId: "user-1",
    gpsLat: -6.9345,
    gpsLng: 107.7223,
  };

  it("records HADIR within the grace period with valid GPS", async () => {
    const result = await recordScan(input, new Date("2026-07-09T00:05:00Z"));

    expect(result).toEqual({ ok: true, status: "HADIR", needsReview: false });
    expect(prisma.absensiSiswa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "HADIR",
          method: "QR",
          gpsValid: true,
        }),
      }),
    );
  });

  it("records TERLAMBAT after the grace period", async () => {
    const result = await recordScan(input, new Date("2026-07-09T00:20:00Z"));
    expect(result.status).toBe("TERLAMBAT");
  });

  it("flags out-of-radius GPS for review without rejecting", async () => {
    const result = await recordScan(
      { ...input, gpsLat: -6.99, gpsLng: 107.8 },
      new Date("2026-07-09T00:05:00Z"),
    );

    expect(result.ok).toBe(true);
    expect(result.needsReview).toBe(true);
    expect(prisma.absensiSiswa.create).toHaveBeenCalled();
  });

  it("rejects an unknown token", async () => {
    vi.mocked(prisma.sesi.findUnique).mockResolvedValue(null);
    const result = await recordScan(input);
    expect(result).toEqual({
      ok: false,
      error: "QR kedaluwarsa, minta guru me-refresh QR",
    });
  });

  it("rejects an expired DYNAMIC token", async () => {
    vi.mocked(getAttendanceSettings).mockResolvedValue({
      ...settings,
      qrMode: "DYNAMIC",
    });
    const result = await recordScan(input, new Date("2026-07-09T00:05:00Z"));
    expect(result.ok).toBe(false);
  });

  it("rejects when the session is closed", async () => {
    vi.mocked(prisma.sesi.findUnique).mockResolvedValue({
      ...baseSesi,
      status: "CLOSED",
    } as unknown as Sesi);
    const result = await recordScan(input);
    expect(result.error).toBe("Tidak ada sesi aktif");
  });

  it("rejects a student from another class", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      ...student,
      kelasId: "other-class",
    } as Student);
    const result = await recordScan(input);
    expect(result.error).toBe("Tidak terdaftar di kelas ini");
  });

  it("is an idempotent no-op for duplicate scans", async () => {
    vi.mocked(prisma.absensiSiswa.findUnique).mockResolvedValue({
      status: "HADIR",
    } as AbsensiSiswa);

    const result = await recordScan(input);

    expect(result).toEqual({ ok: true, status: "HADIR", needsReview: false });
    expect(prisma.absensiSiswa.create).not.toHaveBeenCalled();
  });
});

describe("markManualAttendance", () => {
  it("rejects when the session is not open", async () => {
    vi.mocked(prisma.sesi.findUnique).mockResolvedValue({
      ...baseSesi,
      status: "CLOSED",
    } as unknown as Sesi);

    const result = await markManualAttendance("sesi-1", "student-1", "IZIN");
    expect(result.error).toBe("Tidak ada sesi aktif");
  });

  it("creates a manual record for a non-scanner", async () => {
    vi.mocked(prisma.absensiSiswa.create).mockResolvedValue({
      id: "abs-1",
    } as AbsensiSiswa);

    const result = await markManualAttendance(
      "sesi-1",
      "student-1",
      "IZIN",
      "Izin lisan ke guru",
    );

    expect(result.error).toBeNull();
    expect(prisma.absensiSiswa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "IZIN", method: "MANUAL" }),
      }),
    );
  });
});
