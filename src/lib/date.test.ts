import { describe, it, expect } from "vitest";

import {
  DATE_VALUE_FORMAT,
  formatTanggal,
  parseDateValue,
  toDateValue,
} from "./date";

describe("formatTanggal", () => {
  it("formats a date in Indonesian locale", () => {
    expect(formatTanggal(new Date("2025-01-15"))).toBe("15 Januari 2025");
  });

  it("accepts a date string", () => {
    expect(formatTanggal("2025-08-17")).toBe("17 Agustus 2025");
  });
});

describe("parseDateValue", () => {
  it("parses a yyyy-MM-dd value at local midnight", () => {
    const parsed = parseDateValue("2010-01-15");
    expect(parsed?.getFullYear()).toBe(2010);
    expect(parsed?.getMonth()).toBe(0);
    // The day must survive the parse regardless of the runner's timezone —
    // `new Date("2010-01-15")` would land on the 14th anywhere east of UTC.
    expect(parsed?.getDate()).toBe(15);
  });

  it("returns undefined for an empty value", () => {
    expect(parseDateValue("")).toBeUndefined();
  });

  it("returns undefined for a malformed value", () => {
    expect(parseDateValue("not-a-date")).toBeUndefined();
    expect(parseDateValue("2010-13-45")).toBeUndefined();
  });
});

describe("toDateValue", () => {
  it("serializes a Date to yyyy-MM-dd", () => {
    expect(toDateValue(new Date(2010, 0, 15))).toBe("2010-01-15");
  });

  it("round-trips with parseDateValue", () => {
    const value = "1998-06-30";
    expect(toDateValue(parseDateValue(value)!)).toBe(value);
  });

  it("does not shift the day near midnight", () => {
    expect(toDateValue(new Date(2025, 7, 21, 0, 30))).toBe("2025-08-21");
    expect(toDateValue(new Date(2025, 7, 21, 23, 30))).toBe("2025-08-21");
  });
});

describe("DATE_VALUE_FORMAT", () => {
  it("is the shape a native date input emits", () => {
    expect(DATE_VALUE_FORMAT).toBe("yyyy-MM-dd");
  });
});
