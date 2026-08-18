import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { getStudentByUserId } from "@/src/features/student/services/student.service";
import { getTeacherByUserId } from "@/src/features/master/services/teacher";
import type { SessionUser } from "@/src/features/auth/types";
import type { Student, Teacher } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/student/services/student.service", () => ({
  getStudentByUserId: vi.fn(),
}));
vi.mock("@/src/features/master/services/teacher", () => ({
  getTeacherByUserId: vi.fn(),
}));

describe("GET /api/me/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns the student record for a STUDENT", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);
    vi.mocked(getStudentByUserId).mockResolvedValue({ id: "s1" } as Student);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.student.id).toBe("s1");
    expect(body.data.teacher).toBeNull();
    // A student session must never trigger a teacher lookup.
    expect(getTeacherByUserId).not.toHaveBeenCalled();
  });

  it("returns the teacher record for a TEACHER", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u2",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(getTeacherByUserId).mockResolvedValue({ id: "t1" } as Teacher);

    const body = await (await GET()).json();

    expect(body.data.teacher.id).toBe("t1");
    expect(body.data.student).toBeNull();
    expect(getStudentByUserId).not.toHaveBeenCalled();
  });

  it("returns both as null for an ADMIN", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u3",
      role: "ADMIN",
    } as SessionUser);

    const body = await (await GET()).json();

    expect(body.data.student).toBeNull();
    expect(body.data.teacher).toBeNull();
  });

  it("returns 500 when a lookup throws", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);
    vi.mocked(getStudentByUserId).mockRejectedValue(new Error("db down"));

    expect((await GET()).status).toBe(500);
  });
});
