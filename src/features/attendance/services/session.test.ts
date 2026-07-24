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
import type { TeacherAttendance, Schedule, Session } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    schedule: { findUnique: vi.fn() },
    session: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    teacherAttendance: { findUnique: vi.fn() },
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
const DATE = new Date("2026-07-09T00:00:00.000Z");

const schedule = {
  id: "jadwal-1",
  teacherId: "guru-1",
  classId: "kelas-1",
  dayOfWeek: "THURSDAY",
  startTime: "08:00",
  endTime: "09:30",
  isActive: true,
  kelas: { students: [{ id: "s1", userId: "u1" }] },
} as unknown as Schedule;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAttendanceSettings).mockResolvedValue({
    sessionGracePeriodMinutes: 10,
  } as AttendanceSettings);
  vi.mocked(prisma.schedule.findUnique).mockResolvedValue(schedule);
  vi.mocked(prisma.session.findUnique).mockResolvedValue(null);
  vi.mocked(prisma.teacherAttendance.findUnique).mockResolvedValue(null);
  vi.mocked(getWaliKelasUserId).mockResolvedValue("wali-user");
});

describe("openSession", () => {
  it("opens a session with a QR token", async () => {
    vi.mocked(prisma.session.create).mockResolvedValue({
      id: "sesi-1",
      status: "OPEN",
    } as Session);

    const result = await openSession("jadwal-1", { now: NOW });

    expect(result.error).toBeNull();
    const createArgs = vi.mocked(prisma.session.create).mock.calls[0][0];
    expect(createArgs.data.status).toBe("OPEN");
    expect(createArgs.data.qrToken).toBeTruthy();
    expect(createArgs.data.date).toEqual(DATE);
    expect(createArgs.data.actualTeacherId).toBe("guru-1");
  });

  it("rejects a jadwal scheduled for another day", async () => {
    vi.mocked(prisma.schedule.findUnique).mockResolvedValue({
      ...schedule,
      dayOfWeek: "MONDAY",
    } as unknown as Schedule);

    const result = await openSession("jadwal-1", { now: NOW });
    expect(result.error).toBe("Jadwal bukan untuk hari ini");
  });

  it("returns the existing open session (idempotent)", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      id: "sesi-1",
      status: "OPEN",
    } as Session);

    const result = await openSession("jadwal-1", { now: NOW });

    expect(result.session?.id).toBe("sesi-1");
    expect(prisma.session.create).not.toHaveBeenCalled();
  });

  it("marks NO_CLASS when the teacher is absent with no substitute", async () => {
    vi.mocked(prisma.teacherAttendance.findUnique).mockResolvedValue({
      status: "SICK",
      substituteTeacherId: null,
    } as TeacherAttendance);
    vi.mocked(prisma.session.create).mockResolvedValue({
      id: "sesi-1",
      status: "NO_CLASS",
    } as Session);

    const result = await openSession("jadwal-1", { now: NOW });

    expect(result.session?.status).toBe("NO_CLASS");
    expect(vi.mocked(prisma.session.create).mock.calls[0][0].data.status).toBe(
      "NO_CLASS",
    );
    expect(notifyUsers).toHaveBeenCalledWith(
      ["u1", "wali-user"],
      expect.objectContaining({ type: "NO_CLASS" }),
    );
  });

  it("opens under the substitute when one is assigned", async () => {
    vi.mocked(prisma.teacherAttendance.findUnique).mockResolvedValue({
      status: "EXCUSED",
      substituteTeacherId: "guru-2",
    } as TeacherAttendance);
    vi.mocked(prisma.session.create).mockResolvedValue({
      id: "sesi-1",
    } as Session);

    await openSession("jadwal-1", { now: NOW });

    expect(
      vi.mocked(prisma.session.create).mock.calls[0][0].data.actualTeacherId,
    ).toBe("guru-2");
  });
});

describe("closeSession", () => {
  it("closes and triggers Process 3 deductions", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      id: "sesi-1",
      status: "OPEN",
    } as Session);
    vi.mocked(prisma.session.update).mockResolvedValue({
      id: "sesi-1",
      status: "CLOSED",
    } as Session);

    const result = await closeSession("sesi-1", { now: NOW });

    expect(result.error).toBeNull();
    expect(processSessionDeductions).toHaveBeenCalledWith("sesi-1");
  });

  it("refuses to close twice", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      id: "sesi-1",
      status: "CLOSED",
    } as Session);

    const result = await closeSession("sesi-1");

    expect(result.error).toBe("Sesi sudah ditutup");
    expect(processSessionDeductions).not.toHaveBeenCalled();
  });
});

describe("refreshQrToken", () => {
  it("returns null for a non-open session", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      status: "CLOSED",
    } as Session);
    expect(await refreshQrToken("sesi-1")).toBeNull();
  });
});

describe("autoCloseDueSessions", () => {
  it("closes only sessions past end time + grace", async () => {
    vi.mocked(prisma.session.findMany).mockResolvedValue([
      {
        id: "past",
        date: DATE,
        status: "OPEN",
        jadwal: { endTime: "07:00" }, // cutoff 07:10 WIB = 00:10 UTC
      },
      {
        id: "ongoing",
        date: DATE,
        status: "OPEN",
        jadwal: { endTime: "09:30" },
      },
    ] as unknown as Session[]);
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      id: "past",
      status: "OPEN",
    } as Session);
    vi.mocked(prisma.session.update).mockResolvedValue({
      id: "past",
    } as Session);

    const closed = await autoCloseDueSessions(NOW);

    expect(closed).toBe(1);
    expect(prisma.session.update).toHaveBeenCalledTimes(1);
  });
});
