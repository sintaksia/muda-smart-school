import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { getAttendanceSettings } from "@/src/features/attendance/services/settings";
import type { AttendanceSettings } from "@/src/features/attendance/types";
import { getAdminActionItems } from "./actionItems";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    registration: { count: vi.fn() },
    leaveRequest: { count: vi.fn() },
    creditScore: { groupBy: vi.fn() },
  },
}));

vi.mock("@/src/features/attendance/services/settings", () => ({
  getAttendanceSettings: vi.fn(),
}));

/** Base 100, critical at 60 — a student needs -40 points to be counted. */
const settings = {
  creditScoreBase: 100,
  creditScoreThresholdWarning: 80,
  creditScoreThresholdCritical: 60,
} as AttendanceSettings;

type CreditGroup = Awaited<ReturnType<typeof prisma.creditScore.groupBy>>;

function mockCreditGroups(
  rows: Array<{ studentId: string; points: number }>,
): void {
  vi.mocked(prisma.creditScore.groupBy).mockResolvedValue(
    rows.map((row) => ({
      studentId: row.studentId,
      _sum: { points: row.points },
    })) as unknown as CreditGroup,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAttendanceSettings).mockResolvedValue(settings);
});

describe("getAdminActionItems", () => {
  it("returns pending counts and only students at or below the critical threshold", async () => {
    vi.mocked(prisma.registration.count).mockResolvedValue(4);
    vi.mocked(prisma.leaveRequest.count).mockResolvedValue(2);
    mockCreditGroups([
      { studentId: "s-1", points: -45 }, // 55 -> critical
      { studentId: "s-2", points: -40 }, // 60 -> exactly at threshold, critical
      { studentId: "s-3", points: -39 }, // 61 -> above threshold, ignored
      { studentId: "s-4", points: -10 }, // 90 -> ignored
    ]);

    const result = await getAdminActionItems();

    expect(result).toEqual({
      REGISTRATION_PENDING: 4,
      LEAVE_PENDING: 2,
      CREDIT_CRITICAL: 2,
    });
    expect(prisma.registration.count).toHaveBeenCalledWith({
      where: { status: "PENDING" },
    });
    expect(prisma.leaveRequest.count).toHaveBeenCalledWith({
      where: { status: "PENDING" },
    });
  });

  it("treats a missing points sum as no deduction", async () => {
    vi.mocked(prisma.registration.count).mockResolvedValue(0);
    vi.mocked(prisma.leaveRequest.count).mockResolvedValue(0);
    vi.mocked(prisma.creditScore.groupBy).mockResolvedValue([
      { studentId: "s-1", _sum: { points: null } },
    ] as unknown as CreditGroup);

    const result = await getAdminActionItems();

    expect(result.CREDIT_CRITICAL).toBe(0);
  });

  it("returns all zeroes when there is nothing pending", async () => {
    vi.mocked(prisma.registration.count).mockResolvedValue(0);
    vi.mocked(prisma.leaveRequest.count).mockResolvedValue(0);
    mockCreditGroups([]);

    await expect(getAdminActionItems()).resolves.toEqual({
      REGISTRATION_PENDING: 0,
      LEAVE_PENDING: 0,
      CREDIT_CRITICAL: 0,
    });
  });

  it("degrades to zeroes instead of throwing when a query fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.mocked(prisma.registration.count).mockRejectedValue(
      new Error("db is down"),
    );
    vi.mocked(prisma.leaveRequest.count).mockResolvedValue(3);
    mockCreditGroups([]);

    await expect(getAdminActionItems()).resolves.toEqual({
      REGISTRATION_PENDING: 0,
      LEAVE_PENDING: 0,
      CREDIT_CRITICAL: 0,
    });
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
