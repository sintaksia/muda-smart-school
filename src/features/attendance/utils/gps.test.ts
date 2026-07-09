import { describe, it, expect } from "vitest";
import { distanceMeters, evaluateGps } from "./gps";

const SCHOOL_LAT = -6.9345;
const SCHOOL_LNG = 107.7223;

describe("distanceMeters", () => {
  it("returns 0 for identical coordinates", () => {
    expect(distanceMeters(SCHOOL_LAT, SCHOOL_LNG, SCHOOL_LAT, SCHOOL_LNG)).toBe(
      0,
    );
  });

  it("computes ~111km for one degree of latitude", () => {
    const d = distanceMeters(0, 0, 1, 0);
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });
});

describe("evaluateGps", () => {
  it("marks scans inside the radius as valid", () => {
    const result = evaluateGps(
      SCHOOL_LAT + 0.0003, // ~33m north
      SCHOOL_LNG,
      SCHOOL_LAT,
      SCHOOL_LNG,
      100,
    );
    expect(result).toEqual({ gpsValid: true, needsReview: false });
  });

  it("flags scans outside the radius for review without rejecting", () => {
    const result = evaluateGps(
      SCHOOL_LAT + 0.01, // ~1.1km away
      SCHOOL_LNG,
      SCHOOL_LAT,
      SCHOOL_LNG,
      100,
    );
    expect(result).toEqual({ gpsValid: false, needsReview: true });
  });

  it("flags scans without coordinates for review", () => {
    const result = evaluateGps(
      undefined,
      undefined,
      SCHOOL_LAT,
      SCHOOL_LNG,
      100,
    );
    expect(result).toEqual({ gpsValid: null, needsReview: true });
  });
});
