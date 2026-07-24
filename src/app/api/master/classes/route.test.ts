import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { createClass } from "@/src/features/master/services/schoolClass";
import type { SessionUser } from "@/src/features/auth/types";
import type { SchoolClass } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/schoolClass", () => ({
  getClassList: vi.fn(),
  createClass: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/classes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "X PPLG 1",
  gradeLevel: 10,
  specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
  academicYear: "2026/2027",
};

describe("POST /api/master/classes", () => {
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

  it("creates a class", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(createClass).mockResolvedValue({
      schoolClass: { id: "k1" } as SchoolClass,
      error: null,
    });

    const response = await POST(buildRequest(validBody));
    expect(response.status).toBe(201);
  });

  it("returns 400 for a bad tahun ajaran format", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await POST(
      buildRequest({ ...validBody, academicYear: "2026" }),
    );
    expect(response.status).toBe(400);
    expect(createClass).not.toHaveBeenCalled();
  });
});
