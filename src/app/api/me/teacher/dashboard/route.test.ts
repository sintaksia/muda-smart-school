import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextResponse } from "next/server";
import { GET } from "./route";
import { requireTeacher } from "@/src/features/auth/utils/api-auth";
import { prisma } from "@/src/lib/prisma";
import type { Teacher } from "@prisma/client";

vi.mock("@/src/features/auth/utils/api-auth", () => ({
  requireTeacher: vi.fn(),
}));
vi.mock("@/src/lib/prisma", () => ({
  prisma: { schedule: { findMany: vi.fn() } },
}));

function authorised() {
  vi.mocked(requireTeacher).mockResolvedValue({
    user: { id: "u1" },
    teacher: { id: "t1" },
  } as unknown as { user: never; teacher: Teacher });
}

describe("GET /api/me/teacher/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 2026-08-17 is a Monday. 02:00 UTC is 09:00 WIB, so the WIB calendar day
    // matches — this pins both the date and the day-of-week filter.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-17T02:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes the guard's response through when not a teacher", async () => {
    vi.mocked(requireTeacher).mockResolvedValue({
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    });

    expect((await GET()).status).toBe(403);
  });

  it("returns today's slots scoped to the caller, with session state", async () => {
    authorised();
    vi.mocked(prisma.schedule.findMany).mockResolvedValue([
      {
        id: "sc1",
        startTime: "07:00",
        endTime: "08:30",
        schoolClass: { name: "X RPL 1" },
        subject: { name: "Matematika" },
        sessions: [{ id: "ses1", status: "OPEN" }],
      },
    ] as never);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.date).toBe("2026-08-17");
    expect(body.data.dayOfWeek).toBe("MONDAY");
    expect(body.data.items[0]).toEqual({
      scheduleId: "sc1",
      startTime: "07:00",
      endTime: "08:30",
      className: "X RPL 1",
      subjectName: "Matematika",
      sessionId: "ses1",
      sessionStatus: "OPEN",
    });
    expect(prisma.schedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { dayOfWeek: "MONDAY", isActive: true, teacherId: "t1" },
      }),
    );
  });

  it("reports a null session when none has been opened yet", async () => {
    authorised();
    vi.mocked(prisma.schedule.findMany).mockResolvedValue([
      {
        id: "sc1",
        startTime: "07:00",
        endTime: "08:30",
        schoolClass: { name: "X RPL 1" },
        subject: { name: "Matematika" },
        sessions: [],
      },
    ] as never);

    const body = await (await GET()).json();

    expect(body.data.items[0].sessionId).toBeNull();
    expect(body.data.items[0].sessionStatus).toBeNull();
  });

  it("returns an empty list on a day with no schedule", async () => {
    authorised();
    vi.mocked(prisma.schedule.findMany).mockResolvedValue([] as never);

    const body = await (await GET()).json();

    expect(body.data.items).toEqual([]);
  });

  it("returns 500 when the query throws", async () => {
    authorised();
    vi.mocked(prisma.schedule.findMany).mockRejectedValue(new Error("db down"));

    expect((await GET()).status).toBe(500);
  });
});
