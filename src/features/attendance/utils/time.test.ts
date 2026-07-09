import { describe, it, expect } from "vitest";
import {
  parseTimeToMinutes,
  timeRangesOverlap,
  rangeDurationHours,
  toWibParts,
  dateOnlyUtc,
  wibInstant,
  hariFromDateISO,
} from "./time";

describe("parseTimeToMinutes", () => {
  it("parses HH:mm into minutes", () => {
    expect(parseTimeToMinutes("07:30")).toBe(450);
    expect(parseTimeToMinutes("0:00")).toBe(0);
  });

  it("throws on malformed input", () => {
    expect(() => parseTimeToMinutes("7h30")).toThrow(
      'Format jam tidak valid: "7h30" (harus HH:mm)',
    );
    expect(() => parseTimeToMinutes("25:00")).toThrow();
    expect(() => parseTimeToMinutes("10:75")).toThrow();
  });
});

describe("timeRangesOverlap", () => {
  it("detects overlapping ranges", () => {
    expect(timeRangesOverlap("07:00", "08:30", "08:00", "09:00")).toBe(true);
    expect(timeRangesOverlap("08:00", "09:00", "07:00", "10:00")).toBe(true);
  });

  it("treats back-to-back ranges as non-overlapping", () => {
    expect(timeRangesOverlap("07:00", "08:00", "08:00", "09:00")).toBe(false);
    expect(timeRangesOverlap("09:00", "10:00", "07:00", "08:00")).toBe(false);
  });
});

describe("rangeDurationHours", () => {
  it("computes fractional hours", () => {
    expect(rangeDurationHours("07:00", "08:30")).toBe(1.5);
  });
});

describe("WIB conversions", () => {
  it("converts an instant to WIB date parts", () => {
    // 2026-07-08 23:30 UTC = 2026-07-09 06:30 WIB (Kamis)
    const parts = toWibParts(new Date("2026-07-08T23:30:00.000Z"));
    expect(parts.dateISO).toBe("2026-07-09");
    expect(parts.minutesOfDay).toBe(390);
    expect(parts.hari).toBe("KAMIS");
  });

  it("maps Sunday to null (no schedule)", () => {
    const parts = toWibParts(new Date("2026-07-12T05:00:00.000Z"));
    expect(parts.hari).toBeNull();
  });

  it("builds UTC midnight date and WIB instants", () => {
    expect(dateOnlyUtc("2026-07-09").toISOString()).toBe(
      "2026-07-09T00:00:00.000Z",
    );
    // 07:00 WIB = 00:00 UTC
    expect(wibInstant("2026-07-09", "07:00").toISOString()).toBe(
      "2026-07-09T00:00:00.000Z",
    );
    expect(() => dateOnlyUtc("09-07-2026")).toThrow();
  });

  it("derives HariEnum from a WIB date", () => {
    expect(hariFromDateISO("2026-07-09")).toBe("KAMIS");
    expect(hariFromDateISO("2026-07-12")).toBeNull();
  });
});
