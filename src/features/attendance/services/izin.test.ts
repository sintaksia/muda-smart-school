import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { submitIzin, reviewIzin } from "./izin";
import { getAttendanceSettings } from "./settings";
import { reverseAutoDeduction } from "./credit";
import {
  createNotification,
  getWaliKelasUserId,
  notifyUsers,
} from "./notifications";
import type { AttendanceSettings } from "../types";
import type { AbsensiSiswa, PengajuanIzin, Student } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    student: { findUnique: vi.fn() },
    pengajuanIzin: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    absensiSiswa: { findMany: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("./settings", () => ({ getAttendanceSettings: vi.fn() }));
vi.mock("./credit", () => ({ reverseAutoDeduction: vi.fn() }));
vi.mock("./notifications", () => ({
  createNotification: vi.fn(),
  getWaliKelasUserId: vi.fn(),
  getAdminUserIds: vi.fn().mockResolvedValue(["admin-1"]),
  notifyUsers: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAttendanceSettings).mockResolvedValue({
    izinSakitApprovalRequired: true,
  } as AttendanceSettings);
  vi.mocked(prisma.student.findUnique).mockResolvedValue({
    id: "s1",
    kelasId: "k1",
    userId: "student-user",
    user: { name: "Budi" },
  } as unknown as Student);
  vi.mocked(getWaliKelasUserId).mockResolvedValue("wali-user");
});

describe("submitIzin", () => {
  it("creates a PENDING submission and notifies the wali kelas", async () => {
    vi.mocked(prisma.pengajuanIzin.create).mockResolvedValue({
      id: "izin-1",
      jenis: "SAKIT",
    } as PengajuanIzin);

    const result = await submitIzin({
      studentId: "s1",
      jenis: "SAKIT",
      tanggal: "2026-07-09",
      alasan: "Demam",
    });

    expect(result.error).toBeNull();
    expect(
      vi.mocked(prisma.pengajuanIzin.create).mock.calls[0][0].data.status,
    ).toBe("PENDING");
    expect(notifyUsers).toHaveBeenCalledWith(
      ["wali-user"],
      expect.objectContaining({ type: "IZIN_STATUS" }),
    );
  });

  it("auto-approves when approval is not required", async () => {
    vi.mocked(getAttendanceSettings).mockResolvedValue({
      izinSakitApprovalRequired: false,
    } as AttendanceSettings);
    vi.mocked(prisma.pengajuanIzin.create).mockResolvedValue({
      id: "izin-1",
      jenis: "IZIN",
    } as PengajuanIzin);

    await submitIzin({
      studentId: "s1",
      jenis: "IZIN",
      tanggal: "2026-07-09",
      alasan: "Acara keluarga",
    });

    expect(
      vi.mocked(prisma.pengajuanIzin.create).mock.calls[0][0].data.status,
    ).toBe("APPROVED");
  });

  it("errors for an unknown student", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);
    const result = await submitIzin({
      studentId: "missing",
      jenis: "IZIN",
      tanggal: "2026-07-09",
      alasan: "x",
    });
    expect(result.error).toBe("Siswa tidak ditemukan");
  });
});

describe("reviewIzin", () => {
  const pending = {
    id: "izin-1",
    studentId: "s1",
    jenis: "SAKIT",
    tanggal: new Date("2026-07-09T00:00:00.000Z"),
    jadwalId: null,
    status: "PENDING",
    student: { userId: "student-user" },
  } as unknown as PengajuanIzin;

  it("late approval fixes Alpa records and reverses deductions", async () => {
    vi.mocked(prisma.pengajuanIzin.findUnique).mockResolvedValue(pending);
    vi.mocked(prisma.pengajuanIzin.update).mockResolvedValue({
      ...pending,
      status: "APPROVED",
    } as PengajuanIzin);
    vi.mocked(prisma.absensiSiswa.findMany).mockResolvedValue([
      { id: "abs-1", sesiId: "sesi-1", status: "ALPHA" } as AbsensiSiswa,
    ]);

    const result = await reviewIzin("izin-1", "APPROVED", "wali-user");

    expect(result.error).toBeNull();
    expect(prisma.absensiSiswa.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "SAKIT" }),
      }),
    );
    expect(reverseAutoDeduction).toHaveBeenCalledWith(
      "s1",
      "sesi-1",
      "wali-user",
    );
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "student-user" }),
    );
  });

  it("rejection keeps the original record and notifies with the reason", async () => {
    vi.mocked(prisma.pengajuanIzin.findUnique).mockResolvedValue(pending);
    vi.mocked(prisma.pengajuanIzin.update).mockResolvedValue({
      ...pending,
      status: "REJECTED",
    } as PengajuanIzin);

    const result = await reviewIzin(
      "izin-1",
      "REJECTED",
      "wali-user",
      "Bukti kurang",
    );

    expect(result.error).toBeNull();
    expect(prisma.absensiSiswa.findMany).not.toHaveBeenCalled();
    expect(reverseAutoDeduction).not.toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.stringContaining("Bukti kurang"),
      }),
    );
  });

  it("refuses to re-process a reviewed submission", async () => {
    vi.mocked(prisma.pengajuanIzin.findUnique).mockResolvedValue({
      ...pending,
      status: "APPROVED",
    } as PengajuanIzin);

    const result = await reviewIzin("izin-1", "APPROVED", "wali-user");
    expect(result.error).toBe("Pengajuan sudah diproses");
  });
});
