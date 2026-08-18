import { describe, it, expect, vi } from "vitest";
import { requireCmsAccess, requireAdminAccess } from "./api-auth";
import { getCurrentUser } from "../services/auth";
import type { SessionUser } from "../types";

vi.mock("../services/auth", () => ({
  getCurrentUser: vi.fn(),
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
