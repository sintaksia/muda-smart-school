import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { createSchedule } from "@/src/features/attendance/services/schedule";
import type { SessionUser } from "@/src/features/auth/types";
import type { Schedule } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: { schedule: { findMany: vi.fn() } },
}));
vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/schedule", () => ({
  createSchedule: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/attendance/jadwal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  classId: "k1",
  subjectId: "m1",
  teacherId: "g1",
  dayOfWeek: "MONDAY",
  startTime: "07:00",
  endTime: "08:30",
};

describe("POST /api/attendance/jadwal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);

    const response = await POST(buildRequest(validBody));
    expect(response.status).toBe(403);
  });

  it("creates a valid entry and returns soft warnings", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(createSchedule).mockResolvedValue({
      schedule: { id: "j1" } as Schedule,
      warnings: ["Total jam mengajar mingguan guru (26 jam) melebihi batas"],
      errors: [],
    });

    const response = await POST(buildRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.jadwal.id).toBe("j1");
    expect(data.warnings).toHaveLength(1);
  });

  it("returns the specific clash errors", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(createSchedule).mockResolvedValue({
      schedule: null,
      warnings: [],
      errors: ["Guru bentrok jadwal"],
    });

    const response = await POST(buildRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toContain("Guru bentrok jadwal");
  });

  it("returns 400 for malformed times", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await POST(
      buildRequest({ ...validBody, startTime: "25:99" }),
    );
    expect(response.status).toBe(400);
    expect(createSchedule).not.toHaveBeenCalled();
  });
});
