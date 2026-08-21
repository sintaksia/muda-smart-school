import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  getActiveAcademicYear,
  setActiveAcademicYear,
} from "@/src/features/master/services/academicYear";
import type { SessionUser } from "@/src/features/auth/types";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/academicYear", () => ({
  getActiveAcademicYear: vi.fn(),
  setActiveAcademicYear: vi.fn(),
}));

function putRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/academic-year", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getCurrentUser).mockResolvedValue({
    id: "admin-1",
    role: "ADMIN",
  } as SessionUser);
});

describe("GET /api/master/academic-year", () => {
  it("returns the active year", async () => {
    vi.mocked(getActiveAcademicYear).mockResolvedValue("2026/2027");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.academicYear).toBe("2026/2027");
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await GET();

    expect(response.status).toBe(403);
    expect(getActiveAcademicYear).not.toHaveBeenCalled();
  });
});

describe("PUT /api/master/academic-year", () => {
  it("saves a valid year", async () => {
    vi.mocked(setActiveAcademicYear).mockResolvedValue({
      ok: true,
      error: null,
    });

    const response = await PUT(putRequest({ academicYear: "2026/2027" }));

    expect(response.status).toBe(200);
    expect(setActiveAcademicYear).toHaveBeenCalledWith("2026/2027");
  });

  it("rejects a malformed year", async () => {
    const response = await PUT(putRequest({ academicYear: "2026-2027" }));

    expect(response.status).toBe(400);
    expect(setActiveAcademicYear).not.toHaveBeenCalled();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);

    const response = await PUT(putRequest({ academicYear: "2026/2027" }));

    expect(response.status).toBe(403);
    expect(setActiveAcademicYear).not.toHaveBeenCalled();
  });
});
