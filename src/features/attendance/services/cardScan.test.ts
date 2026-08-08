import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session, Student, StudentAttendance } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import type { AttendanceSettings } from "../types";
import { getAttendanceSettings } from "./settings";
import { recordCardScan } from "./cardScan";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    session: { findUnique: vi.fn() },
    student: { findUnique: vi.fn() },
    studentAttendance: { findUnique: vi.fn(), create: vi.fn() },
  },
}));
vi.mock("./settings", () => ({ getAttendanceSettings: vi.fn() }));

const SETTINGS = {
  sessionGracePeriodMinutes: 10,
  scanMode: "BOTH",
} as AttendanceSettings;

// Session on 2026-08-06, scheduled 07:00 WIB → grace ends 07:10 WIB (00:10 UTC).
const SESSION = {
  id: "sesi-1",
  scheduleId: "sch-1",
  date: new Date("2026-08-06T00:00:00.000Z"),
  status: "OPEN",
  schedule: { classId: "class-1", startTime: "07:00" },
} as unknown as Session;

const STUDENT = {
  id: "s1",
  nis: "1001",
  classId: "class-1",
  status: "AKTIF",
  user: { name: "Ani" },
} as unknown as Student;

const ON_TIME = new Date("2026-08-06T00:05:00.000Z"); // 07:05 WIB
const LATE = new Date("2026-08-06T00:30:00.000Z"); // 07:30 WIB

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAttendanceSettings).mockResolvedValue(SETTINGS);
  vi.mocked(prisma.session.findUnique).mockResolvedValue(SESSION);
  vi.mocked(prisma.student.findUnique).mockResolvedValue(STUDENT);
  vi.mocked(prisma.studentAttendance.findUnique).mockResolvedValue(null);
  vi.mocked(prisma.studentAttendance.create).mockResolvedValue(
    {} as StudentAttendance,
  );
});

describe("recordCardScan", () => {
  it("records a present, card-method scan with no GPS review", async () => {
    const result = await recordCardScan(
      { sessionId: "sesi-1", cardToken: "tok-1" },
      ON_TIME,
    );

    expect(result).toMatchObject({
      ok: true,
      duplicate: false,
      status: "PRESENT",
      studentName: "Ani",
      nis: "1001",
    });
    const created = vi.mocked(prisma.studentAttendance.create).mock.calls[0][0]
      .data;
    expect(created).toMatchObject({
      method: "CARD",
      status: "PRESENT",
      studentId: "s1",
      sessionId: "sesi-1",
    });
    expect(created).not.toHaveProperty("needsReview", true);
    expect(created).not.toHaveProperty("gpsLat");
  });

  it("marks a scan after the grace period as LATE", async () => {
    const result = await recordCardScan(
      { sessionId: "sesi-1", cardToken: "tok-1" },
      LATE,
    );

    expect(result.status).toBe("LATE");
  });

  it("looks the student up by NIS when the card is missing", async () => {
    await recordCardScan({ sessionId: "sesi-1", nis: "1001" }, ON_TIME);

    expect(vi.mocked(prisma.student.findUnique).mock.calls[0][0].where).toEqual(
      {
        nis: "1001",
      },
    );
  });

  it("treats an already-recorded student as a duplicate, not an error", async () => {
    vi.mocked(prisma.studentAttendance.findUnique).mockResolvedValue({
      id: "rec-1",
      status: "PRESENT",
    } as StudentAttendance);

    const result = await recordCardScan(
      { sessionId: "sesi-1", cardToken: "tok-1" },
      ON_TIME,
    );

    expect(result).toMatchObject({
      ok: true,
      duplicate: true,
      status: "PRESENT",
      studentName: "Ani",
    });
    expect(prisma.studentAttendance.create).not.toHaveBeenCalled();
  });

  it("rejects a closed session", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      ...SESSION,
      status: "CLOSED",
    } as unknown as Session);

    const result = await recordCardScan(
      { sessionId: "sesi-1", cardToken: "tok-1" },
      ON_TIME,
    );

    expect(result).toEqual({ ok: false, error: "Tidak ada sesi aktif" });
    expect(prisma.studentAttendance.create).not.toHaveBeenCalled();
  });

  it("rejects card scanning while the school is in STUDENT_SCAN mode", async () => {
    vi.mocked(getAttendanceSettings).mockResolvedValue({
      ...SETTINGS,
      scanMode: "STUDENT_SCAN",
    } as AttendanceSettings);

    const result = await recordCardScan(
      { sessionId: "sesi-1", cardToken: "tok-1" },
      ON_TIME,
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain("tidak mengizinkan");
  });

  it("rejects an unknown card", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);

    const result = await recordCardScan(
      { sessionId: "sesi-1", cardToken: "revoked" },
      ON_TIME,
    );

    expect(result).toEqual({ ok: false, error: "Kartu tidak dikenal" });
  });

  it("rejects a card belonging to another class", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      ...STUDENT,
      classId: "class-2",
    } as unknown as Student);

    const result = await recordCardScan(
      { sessionId: "sesi-1", cardToken: "tok-1" },
      ON_TIME,
    );

    expect(result).toEqual({
      ok: false,
      error: "Tidak terdaftar di kelas ini",
    });
    expect(prisma.studentAttendance.create).not.toHaveBeenCalled();
  });

  it("rejects a card of a student who is no longer active", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      ...STUDENT,
      status: "LULUS",
    } as unknown as Student);

    const result = await recordCardScan(
      { sessionId: "sesi-1", cardToken: "tok-1" },
      ON_TIME,
    );

    expect(result.ok).toBe(false);
  });
});
