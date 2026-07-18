import { describe, it, expect, vi } from "vitest";
import { requireCmsAccess } from "./api-auth";
import { getCurrentUser } from "../services/auth";

vi.mock("../services/auth", () => ({
  getCurrentUser: vi.fn(),
}));

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
