import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import {
  createCreditEntry,
  getCreditTotal,
  reverseAutoDeduction,
} from "./credit";
import { getAttendanceSettings } from "./settings";
import {
  notifyUsers,
  getWaliKelasUserId,
  getAdminUserIds,
} from "./notifications";
import type { AttendanceSettings } from "../types";
import type { CreditScore, Student } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    creditScore: {
      aggregate: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    student: { findUnique: vi.fn() },
    teacher: { findUnique: vi.fn() },
  },
}));

vi.mock("./settings", () => ({ getAttendanceSettings: vi.fn() }));

vi.mock("./notifications", () => ({
  notifyUsers: vi.fn(),
  getWaliKelasUserId: vi.fn(),
  getAdminUserIds: vi.fn(),
  getKepsekUserIds: vi.fn().mockResolvedValue([]),
}));

const settings = {
  creditScoreBase: 100,
  creditScoreThresholdWarning: 70,
  creditScoreThresholdCritical: 40,
  creditPoints: {
    alpaStudent: -10,
    terlambatStudent: -3,
    alpaTeacher: -15,
    terlambatTeacher: -5,
  },
} as AttendanceSettings;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAttendanceSettings).mockResolvedValue(settings);
});

describe("getCreditTotal", () => {
  it("adds the configurable base to the entry sum", async () => {
    vi.mocked(prisma.creditScore.aggregate).mockResolvedValue({
      _sum: { points: -25 },
    } as never);

    expect(await getCreditTotal("STUDENT", "s1", settings)).toBe(75);
  });

  it("returns the base when there are no entries", async () => {
    vi.mocked(prisma.creditScore.aggregate).mockResolvedValue({
      _sum: { points: null },
    } as never);

    expect(await getCreditTotal("TEACHER", "g1", settings)).toBe(100);
  });
});

describe("createCreditEntry", () => {
  it("creates an immutable entry and skips notification when no threshold crossed", async () => {
    vi.mocked(prisma.creditScore.aggregate).mockResolvedValue({
      _sum: { points: 0 },
    } as never);
    vi.mocked(prisma.creditScore.create).mockResolvedValue({
      id: "c1",
    } as CreditScore);

    const entry = await createCreditEntry({
      ownerType: "STUDENT",
      studentId: "s1",
      type: "VIOLATION",
      category: "Kedisiplinan",
      points: -3,
      source: "AUTO",
      refSessionId: "sesi-1",
    });

    expect(entry.id).toBe("c1");
    expect(notifyUsers).not.toHaveBeenCalled();
  });

  it("notifies wali kelas when the warning threshold is crossed", async () => {
    // total before = 100 - 28 = 72; after -3 → 69 crosses warning (70)
    vi.mocked(prisma.creditScore.aggregate).mockResolvedValue({
      _sum: { points: -28 },
    } as never);
    vi.mocked(prisma.creditScore.create).mockResolvedValue({
      id: "c2",
    } as CreditScore);
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      classId: "k1",
      userId: "student-user",
      user: { name: "Budi" },
    } as unknown as Student);
    vi.mocked(getWaliKelasUserId).mockResolvedValue("wali-user");

    await createCreditEntry({
      ownerType: "STUDENT",
      studentId: "s1",
      type: "VIOLATION",
      category: "Kedisiplinan",
      points: -3,
      source: "AUTO",
    });

    expect(notifyUsers).toHaveBeenCalledWith(
      ["wali-user"],
      expect.objectContaining({ type: "CREDIT_WARNING" }),
    );
  });

  it("escalates to BK and student when critical threshold crossed", async () => {
    // before = 100 - 55 = 45; after -10 → 35 crosses critical (40)
    vi.mocked(prisma.creditScore.aggregate).mockResolvedValue({
      _sum: { points: -55 },
    } as never);
    vi.mocked(prisma.creditScore.create).mockResolvedValue({
      id: "c3",
    } as CreditScore);
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      classId: "k1",
      userId: "student-user",
      user: { name: "Budi" },
    } as unknown as Student);
    vi.mocked(getWaliKelasUserId).mockResolvedValue("wali-user");
    vi.mocked(getAdminUserIds).mockResolvedValue(["bk-user"]);

    await createCreditEntry({
      ownerType: "STUDENT",
      studentId: "s1",
      type: "VIOLATION",
      category: "Kedisiplinan",
      points: -10,
      source: "AUTO",
    });

    expect(notifyUsers).toHaveBeenCalledWith(
      ["wali-user", "bk-user", "student-user"],
      expect.objectContaining({ type: "CREDIT_CRITICAL" }),
    );
  });

  it("rejects a student entry without studentId", async () => {
    await expect(
      createCreditEntry({
        ownerType: "STUDENT",
        type: "ACHIEVEMENT",
        category: "Akademik",
        points: 5,
        source: "MANUAL",
      }),
    ).rejects.toThrow("studentId wajib untuk ownerType STUDENT");
  });
});

describe("reverseAutoDeduction", () => {
  it("creates an offsetting CORRECTION entry for the original deduction", async () => {
    vi.mocked(prisma.creditScore.findFirst)
      .mockResolvedValueOnce({
        id: "orig",
        points: -10,
        category: "Kedisiplinan",
      } as CreditScore) // original
      .mockResolvedValueOnce(null); // no existing koreksi
    vi.mocked(prisma.creditScore.aggregate).mockResolvedValue({
      _sum: { points: -10 },
    } as never);
    vi.mocked(prisma.creditScore.create).mockResolvedValue({
      id: "koreksi",
    } as CreditScore);

    const result = await reverseAutoDeduction("s1", "sesi-1", "wali");

    expect(result?.id).toBe("koreksi");
    expect(prisma.creditScore.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: "CORRECTION", points: 10 }),
      }),
    );
  });

  it("is idempotent when a CORRECTION already exists", async () => {
    vi.mocked(prisma.creditScore.findFirst)
      .mockResolvedValueOnce({ id: "orig", points: -10 } as CreditScore)
      .mockResolvedValueOnce({ id: "existing-koreksi" } as CreditScore);

    expect(await reverseAutoDeduction("s1", "sesi-1")).toBeNull();
    expect(prisma.creditScore.create).not.toHaveBeenCalled();
  });

  it("returns null when there was no deduction", async () => {
    vi.mocked(prisma.creditScore.findFirst).mockResolvedValueOnce(null);
    expect(await reverseAutoDeduction("s1", "sesi-1")).toBeNull();
  });
});
