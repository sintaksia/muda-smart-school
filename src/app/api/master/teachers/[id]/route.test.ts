import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { updateTeacher } from "@/src/features/master/services/teacher";
import type { SessionUser } from "@/src/features/auth/types";
import type { Teacher } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/teacher", () => ({
  updateTeacher: vi.fn(),
}));

const routeParams = { params: Promise.resolve({ id: "guru-1" }) };

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/teachers/guru-1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/master/teachers/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates qualifications", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(updateTeacher).mockResolvedValue({
      teacher: { id: "guru-1" } as Teacher,
      error: null,
    });

    const response = await PUT(
      buildRequest({ subjectIds: ["m1", "m2"] }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(updateTeacher).toHaveBeenCalledWith("guru-1", {
      subjectIds: ["m1", "m2"],
    });
  });

  it("returns 400 when the service errors", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(updateTeacher).mockResolvedValue({
      teacher: null,
      error: "Guru tidak ditemukan",
    });

    const response = await PUT(
      buildRequest({ position: "Wakasek" }),
      routeParams,
    );
    expect(response.status).toBe(400);
  });
});
