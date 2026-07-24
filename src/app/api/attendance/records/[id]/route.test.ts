import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { overrideAttendance } from "@/src/features/attendance/services/scan";
import type { SessionUser } from "@/src/features/auth/types";
import type { StudentAttendance } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    teacher: { findUnique: vi.fn() },
    studentAttendance: { findUnique: vi.fn() },
  },
}));
vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/scan", () => ({
  overrideAttendance: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/attendance/records/abs-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const routeParams = { params: Promise.resolve({ id: "abs-1" }) };

describe("PATCH /api/attendance/records/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets the session teacher confirm a flagged scan", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue({
      id: "guru-1",
    } as never);
    vi.mocked(prisma.studentAttendance.findUnique).mockResolvedValue({
      id: "abs-1",
      jadwal: { teacherId: "guru-1" },
      sesi: null,
    } as unknown as StudentAttendance);
    vi.mocked(overrideAttendance).mockResolvedValue({
      id: "abs-1",
      needsReview: false,
    } as StudentAttendance);

    const response = await PATCH(
      buildRequest({ clearReview: true }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(overrideAttendance).toHaveBeenCalledWith("abs-1", {
      clearReview: true,
    });
  });

  it("returns 403 for an unrelated teacher", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue({
      id: "guru-9",
    } as never);
    vi.mocked(prisma.studentAttendance.findUnique).mockResolvedValue({
      id: "abs-1",
      jadwal: { teacherId: "guru-1" },
      sesi: { actualTeacherId: "guru-1" },
    } as unknown as StudentAttendance);

    const response = await PATCH(
      buildRequest({ status: "PRESENT" }),
      routeParams,
    );
    expect(response.status).toBe(403);
    expect(overrideAttendance).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid status", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await PATCH(
      buildRequest({ status: "BOGUS" }),
      routeParams,
    );
    expect(response.status).toBe(400);
  });
});
