import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { getActiveAcademicYear, setActiveAcademicYear } from "./academicYear";
import type { SchoolSetting } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    schoolSetting: { findUnique: vi.fn(), upsert: vi.fn() },
  },
}));

function setting(value: string): SchoolSetting {
  return { value } as SchoolSetting;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getActiveAcademicYear", () => {
  it("returns the stored year", async () => {
    vi.mocked(prisma.schoolSetting.findUnique).mockResolvedValue(
      setting("2025/2026"),
    );
    await expect(getActiveAcademicYear()).resolves.toBe("2025/2026");
  });

  it("falls back to today's year when the row is missing", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-21T00:00:00"));
    vi.mocked(prisma.schoolSetting.findUnique).mockResolvedValue(null);
    await expect(getActiveAcademicYear()).resolves.toBe("2026/2027");
  });

  it("ignores a stored value that is not a valid year", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-10T00:00:00"));
    vi.mocked(prisma.schoolSetting.findUnique).mockResolvedValue(
      setting("dua ribu"),
    );
    await expect(getActiveAcademicYear()).resolves.toBe("2025/2026");
  });
});

describe("setActiveAcademicYear", () => {
  it("upserts a valid year", async () => {
    const result = await setActiveAcademicYear("2026/2027");

    expect(result).toEqual({ ok: true, error: null });
    expect(prisma.schoolSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: "ACTIVE_ACADEMIC_YEAR" },
        update: { value: "2026/2027" },
      }),
    );
  });

  it("rejects a malformed year without touching the database", async () => {
    const result = await setActiveAcademicYear("2026-2027");

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/2026\/2027/);
    expect(prisma.schoolSetting.upsert).not.toHaveBeenCalled();
  });
});
