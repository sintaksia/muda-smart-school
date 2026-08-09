import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { recordScan, markManualAttendance, deleteAttendance } from "./scan";
import { getAttendanceSettings } from "./settings";
import type { AttendanceSettings } from "../types";
import type { StudentAttendance, Session, Student } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    session: { findUnique: vi.fn() },
    student: { findUnique: vi.fn() },
    studentAttendance: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    teacher: { findUnique: vi.fn() },
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

// Session on 2026-07-09 (WIB), 07:00–08:30. Grace until 07:10 WIB = 00:10 UTC.
const baseSession = {
  id: "sesi-1",
  scheduleId: "jadwal-1",
  date: new Date("2026-07-09T00:00:00.000Z"),
  status: "OPEN",
  qrTokenIssuedAt: new Date("2026-07-08T23:59:00.000Z"),
  actualTeacherId: "guru-1",
  schedule: {
    id: "jadwal-1",
    classId: "kelas-1",
    startTime: "07:00",
    endTime: "08:30",
  },
} as unknown as Session;

const student = {
  id: "student-1",
  classId: "kelas-1",
} as Student;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAttendanceSettings).mockResolvedValue(settings);
  vi.mocked(prisma.session.findUnique).mockResolvedValue(baseSession);
  vi.mocked(prisma.student.findUnique).mockResolvedValue(student);
  vi.mocked(prisma.studentAttendance.findUnique).mockResolvedValue(null);
  vi.mocked(prisma.studentAttendance.create).mockResolvedValue(
    {} as StudentAttendance,
  );
});

describe("recordScan", () => {
  const input = {
    token: "tok",
    studentUserId: "user-1",
    gpsLat: -6.9345,
    gpsLng: 107.7223,
  };

  it("records PRESENT within the grace period with valid GPS", async () => {
    const result = await recordScan(input, new Date("2026-07-09T00:05:00Z"));

    expect(result).toEqual({
      ok: true,
      status: "PRESENT",
      needsReview: false,
    });
    expect(prisma.studentAttendance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PRESENT",
          method: "QR",
          gpsValid: true,
        }),
      }),
    );
  });

  it("records LATE after the grace period", async () => {
    const result = await recordScan(input, new Date("2026-07-09T00:20:00Z"));
    expect(result.status).toBe("LATE");
  });

  it("flags out-of-radius GPS for review without rejecting", async () => {
    const result = await recordScan(
      { ...input, gpsLat: -6.99, gpsLng: 107.8 },
      new Date("2026-07-09T00:05:00Z"),
    );

    expect(result.ok).toBe(true);
    expect(result.needsReview).toBe(true);
    expect(prisma.studentAttendance.create).toHaveBeenCalled();
  });

  it("rejects an unknown token", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null);
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
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      ...baseSession,
      status: "CLOSED",
    } as unknown as Session);
    const result = await recordScan(input);
    expect(result.error).toBe("Tidak ada sesi aktif");
  });

  it("rejects a student from another class", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      ...student,
      classId: "other-class",
    } as Student);
    const result = await recordScan(input);
    expect(result.error).toBe("Tidak terdaftar di kelas ini");
  });

  it("is an idempotent no-op for duplicate scans", async () => {
    vi.mocked(prisma.studentAttendance.findUnique).mockResolvedValue({
      status: "PRESENT",
    } as StudentAttendance);

    const result = await recordScan(input);

    expect(result).toEqual({
      ok: true,
      status: "PRESENT",
      needsReview: false,
    });
    expect(prisma.studentAttendance.create).not.toHaveBeenCalled();
  });
});

describe("markManualAttendance", () => {
  it("rejects when the session is not open", async () => {
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      ...baseSession,
      status: "CLOSED",
    } as unknown as Session);

    const result = await markManualAttendance("sesi-1", "student-1", "EXCUSED");
    expect(result.error).toBe("Tidak ada sesi aktif");
  });

  it("creates a manual record for a non-scanner", async () => {
    vi.mocked(prisma.studentAttendance.create).mockResolvedValue({
      id: "abs-1",
    } as StudentAttendance);

    const result = await markManualAttendance(
      "sesi-1",
      "student-1",
      "EXCUSED",
      "Izin lisan ke guru",
    );

    expect(result.error).toBeNull();
    expect(prisma.studentAttendance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "EXCUSED", method: "MANUAL" }),
      }),
    );
  });
});

describe("deleteAttendance", () => {
  it("removes an existing record", async () => {
    vi.mocked(prisma.studentAttendance.findUnique).mockResolvedValue({
      id: "abs-1",
    } as StudentAttendance);

    const removed = await deleteAttendance("abs-1");

    expect(removed).toBe(true);
    expect(prisma.studentAttendance.delete).toHaveBeenCalledWith({
      where: { id: "abs-1" },
    });
  });

  it("reports a missing record without deleting anything", async () => {
    vi.mocked(prisma.studentAttendance.findUnique).mockResolvedValue(null);

    const removed = await deleteAttendance("abs-404");

    expect(removed).toBe(false);
    expect(prisma.studentAttendance.delete).not.toHaveBeenCalled();
  });
});
