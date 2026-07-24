import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { submitLeaveRequest, reviewLeaveRequest } from "./leaveRequest";
import { getAttendanceSettings } from "./settings";
import { reverseAutoDeduction } from "./credit";
import {
  createNotification,
  getWaliKelasUserId,
  notifyUsers,
} from "./notifications";
import type { AttendanceSettings } from "../types";
import type { StudentAttendance, LeaveRequest, Student } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    student: { findUnique: vi.fn() },
    leaveRequest: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    studentAttendance: { findMany: vi.fn(), update: vi.fn() },
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
    classId: "k1",
    userId: "student-user",
    user: { name: "Budi" },
  } as unknown as Student);
  vi.mocked(getWaliKelasUserId).mockResolvedValue("wali-user");
});

describe("submitLeaveRequest", () => {
  it("creates a PENDING submission and notifies the wali kelas", async () => {
    vi.mocked(prisma.leaveRequest.create).mockResolvedValue({
      id: "izin-1",
      type: "SICK",
    } as LeaveRequest);

    const result = await submitLeaveRequest({
      studentId: "s1",
      type: "SICK",
      date: "2026-07-09",
      reason: "Demam",
    });

    expect(result.error).toBeNull();
    expect(
      vi.mocked(prisma.leaveRequest.create).mock.calls[0][0].data.status,
    ).toBe("PENDING");
    expect(notifyUsers).toHaveBeenCalledWith(
      ["wali-user"],
      expect.objectContaining({ type: "LEAVE_STATUS" }),
    );
  });

  it("auto-approves when approval is not required", async () => {
    vi.mocked(getAttendanceSettings).mockResolvedValue({
      izinSakitApprovalRequired: false,
    } as AttendanceSettings);
    vi.mocked(prisma.leaveRequest.create).mockResolvedValue({
      id: "izin-1",
      type: "PERMISSION",
    } as LeaveRequest);

    await submitLeaveRequest({
      studentId: "s1",
      type: "PERMISSION",
      date: "2026-07-09",
      reason: "Acara keluarga",
    });

    expect(
      vi.mocked(prisma.leaveRequest.create).mock.calls[0][0].data.status,
    ).toBe("APPROVED");
  });

  it("errors for an unknown student", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);
    const result = await submitLeaveRequest({
      studentId: "missing",
      type: "PERMISSION",
      date: "2026-07-09",
      reason: "x",
    });
    expect(result.error).toBe("Siswa tidak ditemukan");
  });
});

describe("reviewLeaveRequest", () => {
  const pending = {
    id: "izin-1",
    studentId: "s1",
    type: "SICK",
    date: new Date("2026-07-09T00:00:00.000Z"),
    scheduleId: null,
    status: "PENDING",
    student: { userId: "student-user" },
  } as unknown as LeaveRequest;

  it("late approval fixes Alpa records and reverses deductions", async () => {
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(pending);
    vi.mocked(prisma.leaveRequest.update).mockResolvedValue({
      ...pending,
      status: "APPROVED",
    } as LeaveRequest);
    vi.mocked(prisma.studentAttendance.findMany).mockResolvedValue([
      {
        id: "abs-1",
        sessionId: "sesi-1",
        status: "ABSENT",
      } as StudentAttendance,
    ]);

    const result = await reviewLeaveRequest("izin-1", "APPROVED", "wali-user");

    expect(result.error).toBeNull();
    expect(prisma.studentAttendance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "SICK" }),
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
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue(pending);
    vi.mocked(prisma.leaveRequest.update).mockResolvedValue({
      ...pending,
      status: "REJECTED",
    } as LeaveRequest);

    const result = await reviewLeaveRequest(
      "izin-1",
      "REJECTED",
      "wali-user",
      "Bukti kurang",
    );

    expect(result.error).toBeNull();
    expect(prisma.studentAttendance.findMany).not.toHaveBeenCalled();
    expect(reverseAutoDeduction).not.toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.stringContaining("Bukti kurang"),
      }),
    );
  });

  it("refuses to re-process a reviewed submission", async () => {
    vi.mocked(prisma.leaveRequest.findUnique).mockResolvedValue({
      ...pending,
      status: "APPROVED",
    } as LeaveRequest);

    const result = await reviewLeaveRequest("izin-1", "APPROVED", "wali-user");
    expect(result.error).toBe("Pengajuan sudah diproses");
  });
});
