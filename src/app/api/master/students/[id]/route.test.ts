import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { updateStudent } from "@/src/features/master/services/student";
import type { SessionUser } from "@/src/features/auth/types";
import type { Student } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/student", () => ({
  updateStudent: vi.fn(),
}));

const routeParams = { params: Promise.resolve({ id: "s1" }) };

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/students/s1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/master/students/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await PATCH(buildRequest({ classId: "k1" }), routeParams);
    expect(response.status).toBe(403);
  });

  it("assigns the class", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(updateStudent).mockResolvedValue({
      student: { id: "s1", classId: "k1" } as Student,
      error: null,
    });

    const response = await PATCH(buildRequest({ classId: "k1" }), routeParams);

    expect(response.status).toBe(200);
    expect(updateStudent).toHaveBeenCalledWith("s1", { classId: "k1" });
  });

  it("returns 400 for an invalid status", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await PATCH(
      buildRequest({ status: "MENGHILANG" }),
      routeParams,
    );
    expect(response.status).toBe(400);
    expect(updateStudent).not.toHaveBeenCalled();
  });
});
