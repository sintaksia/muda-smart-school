import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { requireStudent } from "@/src/features/auth/utils/api-auth";
import { getCreditTotal } from "@/src/features/attendance/services/credit";
import { getAttendanceSettings } from "@/src/features/attendance/services/settings";
import { getStudentCard } from "@/src/features/master/services/studentCard";
import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";
import type { AttendanceSettings } from "@/src/features/attendance/types";
import type { Student } from "@prisma/client";

vi.mock("@/src/features/auth/utils/api-auth", () => ({
  requireStudent: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/credit", () => ({
  getCreditTotal: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/settings", () => ({
  getAttendanceSettings: vi.fn(),
}));
vi.mock("@/src/features/master/services/studentCard", () => ({
  getStudentCard: vi.fn(),
}));
vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    studentAttendance: { findMany: vi.fn() },
    leaveRequest: { findMany: vi.fn() },
  },
}));

const settings = (scanMode: AttendanceSettings["scanMode"]) =>
  ({ scanMode }) as AttendanceSettings;

function authorised() {
  vi.mocked(requireStudent).mockResolvedValue({
    user: { id: "u1" },
    student: { id: "s1" },
  } as unknown as { user: never; student: Student });
}

function baseData() {
  vi.mocked(getCreditTotal).mockResolvedValue(85);
  vi.mocked(prisma.studentAttendance.findMany).mockResolvedValue([
    {
      id: "a1",
      date: new Date("2026-08-17T00:00:00.000Z"),
      status: "PRESENT",
      schedule: { subject: { name: "Matematika" } },
    },
  ] as never);
  vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([
    {
      id: "l1",
      type: "SICK",
      date: new Date("2026-08-16T00:00:00.000Z"),
      reason: "Demam",
      status: "PENDING",
    },
  ] as never);
}

describe("GET /api/me/student/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes the guard's response through when not a student", async () => {
    vi.mocked(requireStudent).mockResolvedValue({
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    expect((await GET()).status).toBe(401);
  });

  it("returns the dashboard payload with dates reduced to calendar days", async () => {
    authorised();
    baseData();
    vi.mocked(getAttendanceSettings).mockResolvedValue(settings("BOTH"));
    vi.mocked(getStudentCard).mockResolvedValue({
      studentId: "s1",
      name: "Budi",
      nis: "123",
      className: "X RPL 1",
      photo: null,
      cardToken: "tok",
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.creditTotal).toBe(85);
    expect(body.data.scanMode).toBe("BOTH");
    expect(body.data.card.cardToken).toBe("tok");
    expect(body.data.recentAttendance).toEqual([
      {
        id: "a1",
        date: "2026-08-17",
        subjectName: "Matematika",
        status: "PRESENT",
      },
    ]);
    expect(body.data.recentLeaveRequests[0].date).toBe("2026-08-16");
  });

  // In STUDENT_SCAN mode the student scans the teacher's QR, so no ID card
  // is issued and the lookup must be skipped entirely.
  it("omits the card in STUDENT_SCAN mode without querying for it", async () => {
    authorised();
    baseData();
    vi.mocked(getAttendanceSettings).mockResolvedValue(
      settings("STUDENT_SCAN"),
    );

    const body = await (await GET()).json();

    expect(body.data.card).toBeNull();
    expect(getStudentCard).not.toHaveBeenCalled();
  });

  it("returns 500 when a query throws", async () => {
    authorised();
    vi.mocked(getAttendanceSettings).mockRejectedValue(new Error("db down"));

    expect((await GET()).status).toBe(500);
  });
});
