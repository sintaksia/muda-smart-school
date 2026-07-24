import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { assignSubstitute } from "@/src/features/attendance/services/teacher-attendance";
import type { SessionUser } from "@/src/features/auth/types";
import type { TeacherAttendance } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/teacher-attendance", () => ({
  assignSubstitute: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/attendance/teacher-absence/ag-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const routeParams = { params: Promise.resolve({ id: "ag-1" }) };

describe("PATCH /api/attendance/teacher-absence/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);

    const response = await PATCH(
      buildRequest({ substituteTeacherId: "guru-2" }),
      routeParams,
    );
    expect(response.status).toBe(403);
    expect(assignSubstitute).not.toHaveBeenCalled();
  });

  it("assigns the substitute", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(assignSubstitute).mockResolvedValue({
      record: {
        id: "ag-1",
        substituteTeacherId: "guru-2",
      } as TeacherAttendance,
      error: null,
    });

    const response = await PATCH(
      buildRequest({ substituteTeacherId: "guru-2" }),
      routeParams,
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.substituteTeacherId).toBe("guru-2");
    expect(assignSubstitute).toHaveBeenCalledWith("ag-1", "guru-2");
  });

  it("returns 400 when the service rejects", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(assignSubstitute).mockResolvedValue({
      record: null,
      error: "Guru pengganti tidak boleh guru yang sama",
    });

    const response = await PATCH(
      buildRequest({ substituteTeacherId: "guru-1" }),
      routeParams,
    );
    expect(response.status).toBe(400);
  });
});
