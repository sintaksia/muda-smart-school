import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET } from "./route";
import { requireStudent } from "@/src/features/auth/utils/api-auth";
import { prisma } from "@/src/lib/prisma";
import type { Student } from "@prisma/client";

vi.mock("@/src/features/auth/utils/api-auth", () => ({
  requireStudent: vi.fn(),
}));
vi.mock("@/src/lib/prisma", () => ({
  prisma: { studentAttendance: { findMany: vi.fn() } },
}));

function authorised() {
  vi.mocked(requireStudent).mockResolvedValue({
    user: { id: "u1" },
    student: { id: "s1" },
  } as unknown as { user: never; student: Student });
}

function req(query = ""): NextRequest {
  return new NextRequest(`http://localhost/api/me/student/attendance${query}`);
}

/** n attendance rows, newest first. */
function rows(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `a${i}`,
    date: new Date("2026-08-17T00:00:00.000Z"),
    status: "PRESENT",
    schedule: { subject: { name: "Matematika" } },
  }));
}

describe("GET /api/me/student/attendance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes the guard's response through when not a student", async () => {
    vi.mocked(requireStudent).mockResolvedValue({
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    expect((await GET(req())).status).toBe(401);
  });

  it("scopes the query to the caller's own student id", async () => {
    authorised();
    vi.mocked(prisma.studentAttendance.findMany).mockResolvedValue(
      rows(1) as never,
    );

    await GET(req());

    expect(prisma.studentAttendance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { studentId: "s1" } }),
    );
  });

  it("returns a null cursor when there is no further page", async () => {
    authorised();
    vi.mocked(prisma.studentAttendance.findMany).mockResolvedValue(
      rows(3) as never,
    );

    const body = await (await GET(req("?limit=10"))).json();

    expect(body.data).toHaveLength(3);
    expect(body.nextCursor).toBeNull();
  });

  // The route over-fetches by one row to detect a further page; that extra
  // row must be trimmed off the response.
  it("trims the lookahead row and returns a cursor", async () => {
    authorised();
    vi.mocked(prisma.studentAttendance.findMany).mockResolvedValue(
      rows(6) as never,
    );

    const body = await (await GET(req("?limit=5"))).json();

    expect(prisma.studentAttendance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 6 }),
    );
    expect(body.data).toHaveLength(5);
    expect(body.nextCursor).toBe("a4");
  });

  it("skips the cursor row itself on a later page", async () => {
    authorised();
    vi.mocked(prisma.studentAttendance.findMany).mockResolvedValue(
      rows(2) as never,
    );

    await GET(req("?cursor=a4&limit=5"));

    expect(prisma.studentAttendance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: { id: "a4" }, skip: 1 }),
    );
  });

  it("applies from/to date filters", async () => {
    authorised();
    vi.mocked(prisma.studentAttendance.findMany).mockResolvedValue(
      rows(1) as never,
    );

    await GET(req("?from=2026-08-01&to=2026-08-31"));

    const args = vi.mocked(prisma.studentAttendance.findMany).mock.calls[0][0];
    expect(args?.where?.date).toEqual({
      gte: new Date("2026-08-01T00:00:00.000Z"),
      lte: new Date("2026-08-31T00:00:00.000Z"),
    });
  });

  it("returns 400 for a malformed date filter", async () => {
    authorised();

    const response = await GET(req("?from=17-08-2026"));

    expect(response.status).toBe(400);
    expect(prisma.studentAttendance.findMany).not.toHaveBeenCalled();
  });

  it("returns 500 when the query throws", async () => {
    authorised();
    vi.mocked(prisma.studentAttendance.findMany).mockRejectedValue(
      new Error("db down"),
    );

    expect((await GET(req())).status).toBe(500);
  });
});
