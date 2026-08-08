import { describe, it, expect } from "vitest";
import { ATTENDANCE_SETTING_DEFINITIONS } from "./constants";
import { ATTENDANCE_SCAN_MODE_VALUES } from "@/src/lib/constants";

describe("ATTENDANCE_SETTING_DEFINITIONS", () => {
  it("has unique keys and a non-empty label for every rule", () => {
    const keys = ATTENDANCE_SETTING_DEFINITIONS.map((d) => d.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const definition of ATTENDANCE_SETTING_DEFINITIONS) {
      expect(definition.label.length).toBeGreaterThan(0);
    }
  });

  it("defaults the scan mode to a value the settings reader accepts", () => {
    const scanMode = ATTENDANCE_SETTING_DEFINITIONS.find(
      (d) => d.key === "ATTENDANCE_SCAN_MODE",
    );
    expect(scanMode).toBeDefined();
    expect(ATTENDANCE_SCAN_MODE_VALUES).toContain(scanMode?.value);
  });

  it("keeps every NUMBER rule parseable as a number", () => {
    for (const definition of ATTENDANCE_SETTING_DEFINITIONS.filter(
      (d) => d.type === "NUMBER",
    )) {
      expect(Number.isFinite(Number(definition.value))).toBe(true);
    }
  });
});
