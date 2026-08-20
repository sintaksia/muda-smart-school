import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import type { SessionUser } from "@/src/features/auth/types";
import type { SchoolSetting } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    schoolSetting: { findMany: vi.fn() },
  },
}));
vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));

function rows(pairs: Record<string, string>): SchoolSetting[] {
  return Object.entries(pairs).map(
    ([key, value]) => ({ key, value }) as SchoolSetting,
  );
}

describe("GET /api/me/attendance/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when signed out", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("serves the stored rules to any signed-in role", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);
    vi.mocked(prisma.schoolSetting.findMany).mockResolvedValue(
      rows({
        ATTENDANCE_SCAN_MODE: "TEACHER_SCAN",
        QR_MODE: "DYNAMIC",
        QR_TOKEN_TTL_SECONDS: "30",
      }),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.scanMode).toBe("TEACHER_SCAN");
    expect(body.data.qrMode).toBe("DYNAMIC");
    expect(body.data.qrTokenTtlSeconds).toBe(30);
  });

  it("falls back to defaults for missing rows", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "t1",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(prisma.schoolSetting.findMany).mockResolvedValue([]);

    const body = await (await GET()).json();

    expect(body.data.scanMode).toBe("BOTH");
    expect(body.data.qrMode).toBe("STATIC");
    expect(body.data.sessionGracePeriodMinutes).toBe(10);
  });

  it("never leaks admin-only policy", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);
    vi.mocked(prisma.schoolSetting.findMany).mockResolvedValue([]);

    const body = await (await GET()).json();

    expect(body.data.creditPoints).toBeUndefined();
    expect(body.data.creditScoreThresholdWarning).toBeUndefined();
    expect(body.data.maxWeeklyHours).toBeUndefined();
  });
});
