import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { cloneClassesToAcademicYear } from "@/src/features/master/services/schoolClass";
import type { SessionUser } from "@/src/features/auth/types";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/schoolClass", () => ({
  cloneClassesToAcademicYear: vi.fn(),
}));

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/classes/clone", {
    method: "POST",
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

describe("POST /api/master/classes/clone", () => {
  it("clones the classes into the destination year", async () => {
    vi.mocked(cloneClassesToAcademicYear).mockResolvedValue({
      created: 6,
      skipped: 1,
    });

    const response = await POST(
      postRequest({
        fromAcademicYear: "2025/2026",
        toAcademicYear: "2026/2027",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ created: 6, skipped: 1 });
    expect(cloneClassesToAcademicYear).toHaveBeenCalledWith(
      "2025/2026",
      "2026/2027",
    );
  });

  it("rejects cloning a year onto itself", async () => {
    const response = await POST(
      postRequest({
        fromAcademicYear: "2025/2026",
        toAcademicYear: "2025/2026",
      }),
    );

    expect(response.status).toBe(400);
    expect(cloneClassesToAcademicYear).not.toHaveBeenCalled();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await POST(
      postRequest({
        fromAcademicYear: "2025/2026",
        toAcademicYear: "2026/2027",
      }),
    );

    expect(response.status).toBe(403);
    expect(cloneClassesToAcademicYear).not.toHaveBeenCalled();
  });
});
