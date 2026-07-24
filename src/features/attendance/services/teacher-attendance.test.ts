import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { reportTeacherAbsence, assignSubstitute } from "./teacher-attendance";
import { getAttendanceSettings } from "./settings";
import { createCreditEntry } from "./credit";
import { notifyUsers } from "./notifications";
import type { AttendanceSettings } from "../types";
import type { TeacherAttendance, Teacher, Schedule } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    schedule: { findMany: vi.fn() },
    teacherAttendance: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    creditScore: { findFirst: vi.fn() },
    student: { findMany: vi.fn() },
    teacher: { findUnique: vi.fn() },
    session: { upsert: vi.fn() },
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
    teacherId: "guru-1",
    classId: "kelas-1",
    dayOfWeek: "THURSDAY",
  } as Schedule;

  it("records absence for all schedule entries and notifies", async () => {
    vi.mocked(prisma.schedule.findMany).mockResolvedValue([jadwal]);
    vi.mocked(prisma.teacherAttendance.upsert).mockResolvedValue({
      id: "ag-1",
    } as TeacherAttendance);

    // 2026-07-09 is a Thursday
    const result = await reportTeacherAbsence({
      teacherId: "guru-1",
      date: "2026-07-09",
      status: "EXCUSED",
      reportedById: "admin-user",
    });

    expect(result.error).toBeNull();
    expect(result.records).toHaveLength(1);
    expect(createCreditEntry).not.toHaveBeenCalled(); // EXCUSED → no deduction
    expect(notifyUsers).toHaveBeenCalled();
  });

  it("deducts teacher credit for ABSENT", async () => {
    vi.mocked(prisma.schedule.findMany).mockResolvedValue([jadwal]);
    vi.mocked(prisma.teacherAttendance.upsert).mockResolvedValue({
      id: "ag-1",
    } as TeacherAttendance);

    await reportTeacherAbsence({
      teacherId: "guru-1",
      date: "2026-07-09",
      status: "ABSENT",
    });

    expect(createCreditEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: "TEACHER",
        teacherId: "guru-1",
        points: -15,
      }),
    );
  });

  it("errors when the teacher has no schedule that day", async () => {
    vi.mocked(prisma.schedule.findMany).mockResolvedValue([]);
    const result = await reportTeacherAbsence({
      teacherId: "guru-1",
      date: "2026-07-09",
      status: "EXCUSED",
    });
    expect(result.error).toBe("Guru tidak memiliki jadwal pada tanggal ini");
  });
});

describe("assignSubstitute", () => {
  it("assigns and notifies the substitute", async () => {
    vi.mocked(prisma.teacherAttendance.findUnique).mockResolvedValue({
      id: "ag-1",
      teacherId: "guru-1",
    } as TeacherAttendance);
    vi.mocked(prisma.teacherAttendance.update).mockResolvedValue({
      id: "ag-1",
      substituteTeacherId: "guru-2",
    } as TeacherAttendance);
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue({
      userId: "guru2-user",
    } as Teacher);

    const result = await assignSubstitute("ag-1", "guru-2");

    expect(result.error).toBeNull();
    expect(notifyUsers).toHaveBeenCalledWith(
      ["guru2-user"],
      expect.objectContaining({ type: "TEACHER_ABSENCE" }),
    );
  });

  it("rejects assigning the absent teacher as their own substitute", async () => {
    vi.mocked(prisma.teacherAttendance.findUnique).mockResolvedValue({
      id: "ag-1",
      teacherId: "guru-1",
    } as TeacherAttendance);

    const result = await assignSubstitute("ag-1", "guru-1");
    expect(result.error).toBe("Guru pengganti tidak boleh guru yang sama");
  });
});
