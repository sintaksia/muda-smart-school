import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { createTeacher } from "@/src/features/master/services/guru";
import type { SessionUser } from "@/src/features/auth/types";
import type { Teacher } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/guru", () => ({
  getTeacherList: vi.fn(),
  createTeacher: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/guru", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Bu Sari",
  email: "sari@muda.sch.id",
  password: "Password123",
  gender: "FEMALE",
  birthPlace: "Bandung",
  birthDate: "1990-05-01",
  education: "S1",
  employmentStatus: "GTY",
  subjectIds: ["m1"],
};

describe("POST /api/master/guru", () => {
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

  it("creates a teacher with qualifications", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(createTeacher).mockResolvedValue({
      teacher: { id: "guru-1" } as Teacher,
      error: null,
    });

    const response = await POST(buildRequest(validBody));

    expect(response.status).toBe(201);
    expect(createTeacher).toHaveBeenCalledWith(validBody, "admin-1");
  });

  it("returns 400 without any subject qualification", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await POST(buildRequest({ ...validBody, subjectIds: [] }));
    expect(response.status).toBe(400);
    expect(createTeacher).not.toHaveBeenCalled();
  });
});
