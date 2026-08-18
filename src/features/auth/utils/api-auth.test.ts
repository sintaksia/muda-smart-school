import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  requireCmsAccess,
  requireAdminAccess,
  requireStudent,
  requireTeacher,
} from "./api-auth";
import { getCurrentUser } from "../services/auth";
import { getStudentByUserId } from "@/src/features/student/services/student.service";
import { getTeacherByUserId } from "@/src/features/master/services/teacher";
import type { SessionUser } from "../types";
import type { Student, Teacher } from "@prisma/client";

vi.mock("../services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/student/services/student.service", () => ({
  getStudentByUserId: vi.fn(),
}));
vi.mock("@/src/features/master/services/teacher", () => ({
  getTeacherByUserId: vi.fn(),
}));

function sessionUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: "1",
    email: "admin@test.com",
    name: "Admin",
    role: "ADMIN",
    status: "ACTIVE",
    avatar: null,
    ...overrides,
  };
}

describe("requireCmsAccess", () => {
  it("returns the user when authenticated with an ADMIN role", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "1",
      email: "admin@test.com",
      name: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
      avatar: null,
    });

    const result = await requireCmsAccess();

    expect("user" in result).toBe(true);
    if ("user" in result) {
      expect(result.user.role).toBe("ADMIN");
    }
  });

  it("returns a 401 response when not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await requireCmsAccess();

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(401);
    }
  });

  it("returns a 403 response when authenticated without CMS permission", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "2",
      email: "student@test.com",
      name: "Student",
      role: "STUDENT",
      status: "ACTIVE",
      avatar: null,
    });

    const result = await requireCmsAccess();

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(403);
    }
  });
});

describe("requireAdminAccess", () => {
  it.each(["ADMIN", "SUPER_ADMIN"] as const)(
    "returns the user for role %s",
    async (role) => {
      vi.mocked(getCurrentUser).mockResolvedValue(sessionUser({ role }));

      const result = await requireAdminAccess();

      expect("user" in result).toBe(true);
      if ("user" in result) {
        expect(result.user.role).toBe(role);
      }
    },
  );

  it("returns a 401 response when not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await requireAdminAccess();

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(401);
    }
  });

  // Registration exports carry applicant PII (NIK, family card number, address),
  // so anything below ADMIN must be refused outright.
  it.each(["TEACHER", "STUDENT"] as const)(
    "returns a 403 response for role %s",
    async (role) => {
      vi.mocked(getCurrentUser).mockResolvedValue(
        sessionUser({ id: "2", role }),
      );

      const result = await requireAdminAccess();

      expect("response" in result).toBe(true);
      if ("response" in result) {
        expect(result.response.status).toBe(403);
      }
    },
  );
});

describe("requireStudent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the linked Student record", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      sessionUser({ id: "u1", role: "STUDENT" }),
    );
    vi.mocked(getStudentByUserId).mockResolvedValue({ id: "s1" } as Student);

    const result = await requireStudent();

    expect("student" in result).toBe(true);
    if ("student" in result) {
      expect(result.student.id).toBe("s1");
    }
  });

  it("returns a 401 response when not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await requireStudent();

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(401);
    }
    expect(getStudentByUserId).not.toHaveBeenCalled();
  });

  // Covers both a wrong-role caller and a student whose profile was never
  // linked — the API cannot distinguish them, and both must be refused.
  it("returns a 403 response when no Student record is linked", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      sessionUser({ id: "u2", role: "TEACHER" }),
    );
    vi.mocked(getStudentByUserId).mockResolvedValue(null);

    const result = await requireStudent();

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(403);
    }
  });
});

describe("requireTeacher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the linked Teacher record", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      sessionUser({ id: "u2", role: "TEACHER" }),
    );
    vi.mocked(getTeacherByUserId).mockResolvedValue({ id: "t1" } as Teacher);

    const result = await requireTeacher();

    expect("teacher" in result).toBe(true);
    if ("teacher" in result) {
      expect(result.teacher.id).toBe("t1");
    }
  });

  it("returns a 401 response when not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await requireTeacher();

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(401);
    }
    expect(getTeacherByUserId).not.toHaveBeenCalled();
  });

  it("returns a 403 response when no Teacher record is linked", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      sessionUser({ id: "u1", role: "STUDENT" }),
    );
    vi.mocked(getTeacherByUserId).mockResolvedValue(null);

    const result = await requireTeacher();

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(403);
    }
  });
});
