import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { getStudentByUserId } from "@/src/features/student/services/student.service";
import { getTeacherByUserId } from "@/src/features/master/services/teacher";
import { prisma } from "@/src/lib/prisma";
import type { SessionUser } from "@/src/features/auth/types";
import type { Student, Teacher } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/student/services/student.service", () => ({
  getStudentByUserId: vi.fn(),
}));
vi.mock("@/src/features/master/services/teacher", () => ({
  getTeacherByUserId: vi.fn(),
}));
vi.mock("@/src/lib/prisma", () => ({
  prisma: { schedule: { findMany: vi.fn() } },
}));

function signedInAs(role: SessionUser["role"]) {
  vi.mocked(getCurrentUser).mockResolvedValue({
    id: "u1",
    role,
  } as SessionUser);
}

const scheduleRow = {
  id: "sc1",
  dayOfWeek: "MONDAY",
  startTime: "07:00",
  endTime: "08:30",
  schoolClass: { name: "X RPL 1" },
  subject: { name: "Matematika" },
  teacher: { user: { name: "Pak Guru" } },
};

describe("GET /api/me/schedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    expect((await GET()).status).toBe(401);
  });

  it("scopes to the student's class and flattens the row", async () => {
    signedInAs("STUDENT");
    vi.mocked(getStudentByUserId).mockResolvedValue({
      id: "s1",
      classId: "c1",
    } as Student);
    vi.mocked(prisma.schedule.findMany).mockResolvedValue([
      scheduleRow,
    ] as never);

    const body = await (await GET()).json();

    expect(prisma.schedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true, classId: "c1" } }),
    );
    expect(body.data[0]).toEqual({
      scheduleId: "sc1",
      dayOfWeek: "MONDAY",
      startTime: "07:00",
      endTime: "08:30",
      className: "X RPL 1",
      subjectName: "Matematika",
      teacherName: "Pak Guru",
    });
  });

  // A student who has not been placed in a class yet has no timetable. That is
  // an empty state, not an error.
  it("returns an empty list for a student with no class, without querying", async () => {
    signedInAs("STUDENT");
    vi.mocked(getStudentByUserId).mockResolvedValue({
      id: "s1",
      classId: null,
    } as Student);

    const body = await (await GET()).json();

    expect(body.data).toEqual([]);
    expect(prisma.schedule.findMany).not.toHaveBeenCalled();
  });

  it("returns 403 for a student account with no Student record", async () => {
    signedInAs("STUDENT");
    vi.mocked(getStudentByUserId).mockResolvedValue(null);

    expect((await GET()).status).toBe(403);
  });

  it("scopes to the teacher's own slots", async () => {
    signedInAs("TEACHER");
    vi.mocked(getTeacherByUserId).mockResolvedValue({ id: "t1" } as Teacher);
    vi.mocked(prisma.schedule.findMany).mockResolvedValue([
      scheduleRow,
    ] as never);

    await GET();

    expect(prisma.schedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true, teacherId: "t1" } }),
    );
  });

  it("returns 403 for a teacher account with no Teacher record", async () => {
    signedInAs("TEACHER");
    vi.mocked(getTeacherByUserId).mockResolvedValue(null);

    expect((await GET()).status).toBe(403);
  });

  // Admins get the whole timetable from /api/attendance/schedules instead.
  it.each(["ADMIN", "SUPER_ADMIN"] as const)(
    "returns 403 for %s",
    async (role) => {
      signedInAs(role);

      expect((await GET()).status).toBe(403);
      expect(prisma.schedule.findMany).not.toHaveBeenCalled();
    },
  );

  it("returns 500 when the query throws", async () => {
    signedInAs("TEACHER");
    vi.mocked(getTeacherByUserId).mockResolvedValue({ id: "t1" } as Teacher);
    vi.mocked(prisma.schedule.findMany).mockRejectedValue(new Error("db down"));

    expect((await GET()).status).toBe(500);
  });
});
