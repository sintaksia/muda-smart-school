import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "./route";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import type { SessionUser } from "@/src/features/auth/types";
import type { SchoolSetting } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    schoolSetting: { findMany: vi.fn(), update: vi.fn() },
  },
}));
vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/attendance/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/attendance/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);

    const response = await PUT(
      buildRequest({ settings: { QR_MODE: "DYNAMIC" } }),
    );
    expect(response.status).toBe(403);
  });

  it("updates known keys", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(prisma.schoolSetting.update).mockResolvedValue(
      {} as SchoolSetting,
    );

    const response = await PUT(
      buildRequest({
        settings: { QR_MODE: "DYNAMIC", SESSION_GRACE_PERIOD_MINUTES: "15" },
      }),
    );

    expect(response.status).toBe(200);
    expect(prisma.schoolSetting.update).toHaveBeenCalledTimes(2);
  });

  it("rejects unknown keys", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await PUT(
      buildRequest({ settings: { HACK_THE_PLANET: "yes" } }),
    );
    expect(response.status).toBe(400);
    expect(prisma.schoolSetting.update).not.toHaveBeenCalled();
  });
});
