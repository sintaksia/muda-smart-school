import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { submitLeaveRequest } from "@/src/features/attendance/services/izin";
import type { SessionUser } from "@/src/features/auth/types";
import type { LeaveRequest, Student } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    student: { findUnique: vi.fn() },
    teacher: { findUnique: vi.fn() },
    leaveRequest: { findMany: vi.fn() },
  },
}));
vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/izin", () => ({
  submitLeaveRequest: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/attendance/izin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  type: "SICK",
  date: "2026-07-09",
  reason: "Demam tinggi",
};

describe("POST /api/attendance/izin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits for the logged-in student's own record", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
    } as Student);
    vi.mocked(submitLeaveRequest).mockResolvedValue({
      izin: { id: "izin-1" } as LeaveRequest,
      error: null,
    });

    const response = await POST(
      buildRequest({ ...validBody, studentId: "someone-else" }),
    );

    expect(response.status).toBe(201);
    expect(submitLeaveRequest).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: "s1", submittedById: "u1" }),
    );
  });

  it("requires studentId for admin submissions", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await POST(buildRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("studentId wajib diisi");
  });

  it("returns 400 for an invalid date format", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await POST(
      buildRequest({ ...validBody, date: "09/07/2026" }),
    );
    expect(response.status).toBe(400);
    expect(submitLeaveRequest).not.toHaveBeenCalled();
  });
});
