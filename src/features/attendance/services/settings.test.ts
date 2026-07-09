import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { getAttendanceSettings } from "./settings";
import type { SchoolSetting } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    schoolSetting: {
      findMany: vi.fn(),
    },
  },
}));

function rows(entries: Record<string, string>): SchoolSetting[] {
  return Object.entries(entries).map(
    ([key, value]) => ({ key, value }) as SchoolSetting,
  );
}

describe("getAttendanceSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns defaults when no settings rows exist", async () => {
    vi.mocked(prisma.schoolSetting.findMany).mockResolvedValue([]);

    const settings = await getAttendanceSettings();

    expect(settings.sessionGracePeriodMinutes).toBe(10);
    expect(settings.qrMode).toBe("STATIC");
    expect(settings.creditPoints.alpaStudent).toBe(-10);
    expect(settings.creditScoreThresholdCritical).toBe(40);
    expect(settings.izinSakitApprovalRequired).toBe(true);
  });

  it("uses stored values over defaults", async () => {
    vi.mocked(prisma.schoolSetting.findMany).mockResolvedValue(
      rows({
        SESSION_GRACE_PERIOD_MINUTES: "15",
        QR_MODE: "DYNAMIC",
        CREDIT_POINTS_ALPA_STUDENT: "-20",
        IZIN_SAKIT_APPROVAL_REQUIRED: "false",
      }),
    );

    const settings = await getAttendanceSettings();

    expect(settings.sessionGracePeriodMinutes).toBe(15);
    expect(settings.qrMode).toBe("DYNAMIC");
    expect(settings.creditPoints.alpaStudent).toBe(-20);
    expect(settings.izinSakitApprovalRequired).toBe(false);
  });

  it("falls back to defaults for non-numeric values", async () => {
    vi.mocked(prisma.schoolSetting.findMany).mockResolvedValue(
      rows({ GPS_RADIUS_METERS: "abc" }),
    );

    const settings = await getAttendanceSettings();

    expect(settings.gpsRadiusMeters).toBe(100);
  });
});
