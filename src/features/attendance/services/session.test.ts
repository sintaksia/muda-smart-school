import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import {
  openSession,
  closeSession,
  refreshQrToken,
  autoCloseDueSessions,
} from "./session";
import { getAttendanceSettings } from "./settings";
import { processSessionDeductions } from "./deduction";
import { notifyUsers, getWaliKelasUserId } from "./notifications";
import type { AttendanceSettings } from "../types";
import type { AbsensiGuru, Jadwal, Sesi } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    jadwal: { findUnique: vi.fn() },
    sesi: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    absensiGuru: { findUnique: vi.fn() },
  },
}));

vi.mock("./settings", () => ({ getAttendanceSettings: vi.fn() }));
vi.mock("./deduction", () => ({ processSessionDeductions: vi.fn() }));
vi.mock("./notifications", () => ({
  notifyUsers: vi.fn(),
  getWaliKelasUserId: vi.fn(),
}));

// Kamis 2026-07-09 08:00 WIB = 01:00 UTC
const NOW = new Date("2026-07-09T01:00:00.000Z");
const TANGGAL = new Date("2026-07-09T00:00:00.000Z");

const jadwal = {
  id: "jadwal-1",
  guruId: "guru-1",
  kelasId: "kelas-1",
  hari: "KAMIS",
  jamMulai: "08:00",
  jamSelesai: "09:30",
  isActive: true,
  kelas: { students: [{ id: "s1", userId: "u1" }] },
} as unknown as Jadwal;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAttendanceSettings).mockResolvedValue({
    sessionGracePeriodMinutes: 10,
  } as AttendanceSettings);
  vi.mocked(prisma.jadwal.findUnique).mockResolvedValue(jadwal);
  vi.mocked(prisma.sesi.findUnique).mockResolvedValue(null);
  vi.mocked(prisma.absensiGuru.findUnique).mockResolvedValue(null);
  vi.mocked(getWaliKelasUserId).mockResolvedValue("wali-user");
});

describe("openSession", () => {
  it("opens a session with a QR token", async () => {
    vi.mocked(prisma.sesi.create).mockResolvedValue({
      id: "sesi-1",
      status: "OPEN",
    } as Sesi);

    const result = await openSession("jadwal-1", { now: NOW });

    expect(result.error).toBeNull();
    const createArgs = vi.mocked(prisma.sesi.create).mock.calls[0][0];
    expect(createArgs.data.status).toBe("OPEN");
    expect(createArgs.data.qrToken).toBeTruthy();
    expect(createArgs.data.tanggal).toEqual(TANGGAL);
    expect(createArgs.data.actualGuruId).toBe("guru-1");
  });

  it("rejects a jadwal scheduled for another day", async () => {
    vi.mocked(prisma.jadwal.findUnique).mockResolvedValue({
      ...jadwal,
      hari: "SENIN",
    } as unknown as Jadwal);

    const result = await openSession("jadwal-1", { now: NOW });
    expect(result.error).toBe("Jadwal bukan untuk hari ini");
  });

  it("returns the existing open session (idempotent)", async () => {
    vi.mocked(prisma.sesi.findUnique).mockResolvedValue({
      id: "sesi-1",
      status: "OPEN",
    } as Sesi);

    const result = await openSession("jadwal-1", { now: NOW });

    expect(result.sesi?.id).toBe("sesi-1");
    expect(prisma.sesi.create).not.toHaveBeenCalled();
  });

  it("marks KELAS_KOSONG when the teacher is absent with no substitute", async () => {
    vi.mocked(prisma.absensiGuru.findUnique).mockResolvedValue({
      status: "SAKIT",
      substituteGuruId: null,
    } as AbsensiGuru);
    vi.mocked(prisma.sesi.create).mockResolvedValue({
      id: "sesi-1",
      status: "KELAS_KOSONG",
    } as Sesi);

    const result = await openSession("jadwal-1", { now: NOW });

    expect(result.sesi?.status).toBe("KELAS_KOSONG");
    expect(vi.mocked(prisma.sesi.create).mock.calls[0][0].data.status).toBe(
      "KELAS_KOSONG",
    );
    expect(notifyUsers).toHaveBeenCalledWith(
      ["u1", "wali-user"],
      expect.objectContaining({ type: "KELAS_KOSONG" }),
    );
  });

  it("opens under the substitute when one is assigned", async () => {
    vi.mocked(prisma.absensiGuru.findUnique).mockResolvedValue({
      status: "IZIN",
      substituteGuruId: "guru-2",
    } as AbsensiGuru);
    vi.mocked(prisma.sesi.create).mockResolvedValue({ id: "sesi-1" } as Sesi);

    await openSession("jadwal-1", { now: NOW });

    expect(
      vi.mocked(prisma.sesi.create).mock.calls[0][0].data.actualGuruId,
    ).toBe("guru-2");
  });
});

describe("closeSession", () => {
  it("closes and triggers Process 3 deductions", async () => {
    vi.mocked(prisma.sesi.findUnique).mockResolvedValue({
      id: "sesi-1",
      status: "OPEN",
    } as Sesi);
    vi.mocked(prisma.sesi.update).mockResolvedValue({
      id: "sesi-1",
      status: "CLOSED",
    } as Sesi);

    const result = await closeSession("sesi-1", { now: NOW });

    expect(result.error).toBeNull();
    expect(processSessionDeductions).toHaveBeenCalledWith("sesi-1");
  });

  it("refuses to close twice", async () => {
    vi.mocked(prisma.sesi.findUnique).mockResolvedValue({
      id: "sesi-1",
      status: "CLOSED",
    } as Sesi);

    const result = await closeSession("sesi-1");

    expect(result.error).toBe("Sesi sudah ditutup");
    expect(processSessionDeductions).not.toHaveBeenCalled();
  });
});

describe("refreshQrToken", () => {
  it("returns null for a non-open session", async () => {
    vi.mocked(prisma.sesi.findUnique).mockResolvedValue({
      status: "CLOSED",
    } as Sesi);
    expect(await refreshQrToken("sesi-1")).toBeNull();
  });
});

describe("autoCloseDueSessions", () => {
  it("closes only sessions past end time + grace", async () => {
    vi.mocked(prisma.sesi.findMany).mockResolvedValue([
      {
        id: "past",
        tanggal: TANGGAL,
        status: "OPEN",
        jadwal: { jamSelesai: "07:00" }, // cutoff 07:10 WIB = 00:10 UTC
      },
      {
        id: "ongoing",
        tanggal: TANGGAL,
        status: "OPEN",
        jadwal: { jamSelesai: "09:30" },
      },
    ] as unknown as Sesi[]);
    vi.mocked(prisma.sesi.findUnique).mockResolvedValue({
      id: "past",
      status: "OPEN",
    } as Sesi);
    vi.mocked(prisma.sesi.update).mockResolvedValue({ id: "past" } as Sesi);

    const closed = await autoCloseDueSessions(NOW);

    expect(closed).toBe(1);
    expect(prisma.sesi.update).toHaveBeenCalledTimes(1);
  });
});
