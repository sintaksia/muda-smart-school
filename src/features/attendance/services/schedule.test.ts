import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { validateSchedule, createSchedule, updateSchedule } from "./schedule";
import { getAttendanceSettings } from "./settings";
import type { AttendanceSettings } from "../types";
import type { TeacherSubject, Schedule } from "@prisma/client";
import type { ScheduleInput } from "../types";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    teacherSubject: { findUnique: vi.fn() },
    schedule: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("./settings", () => ({ getAttendanceSettings: vi.fn() }));

const input: ScheduleInput = {
  classId: "kelas-1",
  subjectId: "mapel-1",
  teacherId: "guru-1",
  dayOfWeek: "MONDAY",
  startTime: "07:00",
  endTime: "08:30",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAttendanceSettings).mockResolvedValue({
    maxWeeklyHours: 24,
  } as AttendanceSettings);
  vi.mocked(prisma.teacherSubject.findUnique).mockResolvedValue({
    id: "gmp-1",
  } as TeacherSubject);
  vi.mocked(prisma.schedule.findMany).mockResolvedValue([]);
});

describe("validateSchedule", () => {
  it("accepts a valid entry", async () => {
    const result = await validateSchedule(input);
    expect(result).toEqual({ valid: true, errors: [], warnings: [] });
  });

  it("rejects an unqualified teacher with the specific message", async () => {
    vi.mocked(prisma.teacherSubject.findUnique).mockResolvedValue(null);
    const result = await validateSchedule(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Guru tidak terdaftar untuk mata pelajaran ini",
    );
  });

  it("detects teacher and class clashes", async () => {
    vi.mocked(prisma.schedule.findMany)
      .mockResolvedValueOnce([
        {
          id: "j2",
          teacherId: "guru-1",
          classId: "other",
          startTime: "08:00",
          endTime: "09:00",
        },
        {
          id: "j3",
          teacherId: "other-guru",
          classId: "kelas-1",
          startTime: "07:30",
          endTime: "08:00",
        },
      ] as Schedule[])
      .mockResolvedValueOnce([]);

    const result = await validateSchedule(input);

    expect(result.errors).toContain("Guru bentrok jadwal");
    expect(result.errors).toContain("Kelas bentrok jadwal");
  });

  it("warns (without blocking) when weekly hours exceed the max", async () => {
    vi.mocked(prisma.schedule.findMany)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(
        Array.from({ length: 16 }, (_, i) => ({
          startTime: "07:00",
          endTime: "08:30",
          id: `w${i}`,
        })) as Schedule[],
      );

    const result = await validateSchedule(input);

    expect(result.valid).toBe(true);
    expect(result.warnings[0]).toContain("melebihi batas 24 jam");
  });

  it("rejects an end time before the start time", async () => {
    const result = await validateSchedule({
      ...input,
      startTime: "09:00",
      endTime: "08:00",
    });
    expect(result.errors).toContain("Jam selesai harus setelah jam mulai");
  });
});

describe("createSchedule", () => {
  it("creates when valid", async () => {
    vi.mocked(prisma.schedule.create).mockResolvedValue({
      id: "j1",
    } as Schedule);
    const result = await createSchedule(input);
    expect(result.schedule?.id).toBe("j1");
  });

  it("returns errors without creating when invalid", async () => {
    vi.mocked(prisma.teacherSubject.findUnique).mockResolvedValue(null);
    const result = await createSchedule(input);
    expect(result.schedule).toBeNull();
    expect(prisma.schedule.create).not.toHaveBeenCalled();
  });
});

describe("updateSchedule", () => {
  it("versions the entry: deactivates the old row and creates a new one", async () => {
    vi.mocked(prisma.schedule.findUnique).mockResolvedValue({
      id: "j1",
      isActive: true,
    } as Schedule);
    vi.mocked(prisma.$transaction).mockResolvedValue([
      { id: "j1", isActive: false },
      { id: "j2" },
    ]);

    const result = await updateSchedule("j1", input);

    expect(result.schedule?.id).toBe("j2");
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("errors for a missing or inactive entry", async () => {
    vi.mocked(prisma.schedule.findUnique).mockResolvedValue(null);
    const result = await updateSchedule("missing", input);
    expect(result.errors).toContain("Jadwal tidak ditemukan");
  });
});
