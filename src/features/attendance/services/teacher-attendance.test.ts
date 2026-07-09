import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { reportTeacherAbsence, assignSubstitute } from "./teacher-attendance";
import { getAttendanceSettings } from "./settings";
import { createCreditEntry } from "./credit";
import { notifyUsers } from "./notifications";
import type { AttendanceSettings } from "../types";
import type { AbsensiGuru, Guru, Jadwal } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    jadwal: { findMany: vi.fn() },
    absensiGuru: { upsert: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    creditScore: { findFirst: vi.fn() },
    student: { findMany: vi.fn() },
    guru: { findUnique: vi.fn() },
    sesi: { upsert: vi.fn() },
  },
}));

vi.mock("./settings", () => ({ getAttendanceSettings: vi.fn() }));
vi.mock("./credit", () => ({ createCreditEntry: vi.fn() }));
vi.mock("./notifications", () => ({
  notifyUsers: vi.fn(),
  getWaliKelasUserId: vi.fn().mockResolvedValue("wali-user"),
  getAdminUserIds: vi.fn().mockResolvedValue(["admin-1"]),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAttendanceSettings).mockResolvedValue({
    sessionGracePeriodMinutes: 10,
    creditPoints: {
      alpaStudent: -10,
      terlambatStudent: -3,
      alpaTeacher: -15,
      terlambatTeacher: -5,
    },
  } as AttendanceSettings);
  vi.mocked(prisma.creditScore.findFirst).mockResolvedValue(null);
  vi.mocked(prisma.student.findMany).mockResolvedValue([]);
});

describe("reportTeacherAbsence", () => {
  const jadwal = {
    id: "jadwal-1",
    guruId: "guru-1",
    kelasId: "kelas-1",
    hari: "KAMIS",
  } as Jadwal;

  it("records absence for all schedule entries and notifies", async () => {
    vi.mocked(prisma.jadwal.findMany).mockResolvedValue([jadwal]);
    vi.mocked(prisma.absensiGuru.upsert).mockResolvedValue({
      id: "ag-1",
    } as AbsensiGuru);

    // 2026-07-09 is a Thursday
    const result = await reportTeacherAbsence({
      guruId: "guru-1",
      tanggal: "2026-07-09",
      status: "IZIN",
      reportedById: "admin-user",
    });

    expect(result.error).toBeNull();
    expect(result.records).toHaveLength(1);
    expect(createCreditEntry).not.toHaveBeenCalled(); // IZIN → no deduction
    expect(notifyUsers).toHaveBeenCalled();
  });

  it("deducts teacher credit for ALPHA", async () => {
    vi.mocked(prisma.jadwal.findMany).mockResolvedValue([jadwal]);
    vi.mocked(prisma.absensiGuru.upsert).mockResolvedValue({
      id: "ag-1",
    } as AbsensiGuru);

    await reportTeacherAbsence({
      guruId: "guru-1",
      tanggal: "2026-07-09",
      status: "ALPHA",
    });

    expect(createCreditEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: "TEACHER",
        guruId: "guru-1",
        points: -15,
      }),
    );
  });

  it("errors when the teacher has no schedule that day", async () => {
    vi.mocked(prisma.jadwal.findMany).mockResolvedValue([]);
    const result = await reportTeacherAbsence({
      guruId: "guru-1",
      tanggal: "2026-07-09",
      status: "IZIN",
    });
    expect(result.error).toBe("Guru tidak memiliki jadwal pada tanggal ini");
  });
});

describe("assignSubstitute", () => {
  it("assigns and notifies the substitute", async () => {
    vi.mocked(prisma.absensiGuru.findUnique).mockResolvedValue({
      id: "ag-1",
      guruId: "guru-1",
    } as AbsensiGuru);
    vi.mocked(prisma.absensiGuru.update).mockResolvedValue({
      id: "ag-1",
      substituteGuruId: "guru-2",
    } as AbsensiGuru);
    vi.mocked(prisma.guru.findUnique).mockResolvedValue({
      userId: "guru2-user",
    } as Guru);

    const result = await assignSubstitute("ag-1", "guru-2");

    expect(result.error).toBeNull();
    expect(notifyUsers).toHaveBeenCalledWith(
      ["guru2-user"],
      expect.objectContaining({ type: "TEACHER_ABSENCE" }),
    );
  });

  it("rejects assigning the absent teacher as their own substitute", async () => {
    vi.mocked(prisma.absensiGuru.findUnique).mockResolvedValue({
      id: "ag-1",
      guruId: "guru-1",
    } as AbsensiGuru);

    const result = await assignSubstitute("ag-1", "guru-1");
    expect(result.error).toBe("Guru pengganti tidak boleh guru yang sama");
  });
});
