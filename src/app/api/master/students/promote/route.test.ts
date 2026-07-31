import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { promoteAcceptedRegistrations } from "@/src/features/master/services/studentPromotion";
import type { SessionUser } from "@/src/features/auth/types";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/studentPromotion", () => ({
  promoteAcceptedRegistrations: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/master/students/promote", () => {
  it("promotes the accepted registrations and returns the summary", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(promoteAcceptedRegistrations).mockResolvedValue({
      created: 2,
      credentials: [],
      failures: [],
    });

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.created).toBe(2);
    expect(promoteAcceptedRegistrations).toHaveBeenCalledWith("admin-1");
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await POST();

    expect(response.status).toBe(403);
    expect(promoteAcceptedRegistrations).not.toHaveBeenCalled();
  });
});
