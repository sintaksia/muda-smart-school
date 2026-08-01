import { describe, expect, it } from "vitest";
import {
  EMPTY_SELECT_VALUE,
  fromSelectValue,
  toSelectValue,
} from "./selectSentinel";

describe("toSelectValue", () => {
  it("passes a real value through untouched", () => {
    expect(toSelectValue("AUTOMOTIVE_ENGINEERING")).toBe(
      "AUTOMOTIVE_ENGINEERING",
    );
  });

  it.each([
    ["", "empty string"] as const,
    [null, "null"] as const,
    [undefined, "undefined"] as const,
  ])("maps %s (%s) to the sentinel", (value) => {
    // Radix throws if a SelectItem carries "", so every empty representation
    // has to collapse onto one non-empty token.
    expect(toSelectValue(value)).toBe(EMPTY_SELECT_VALUE);
  });
});

describe("fromSelectValue", () => {
  it("passes a real value through untouched", () => {
    expect(fromSelectValue("SICK", "")).toBe("SICK");
  });

  it("restores the caller's empty representation", () => {
    expect(fromSelectValue(EMPTY_SELECT_VALUE, "")).toBe("");
    expect(fromSelectValue(EMPTY_SELECT_VALUE, null)).toBeNull();
  });

  it("round-trips every empty representation", () => {
    expect(fromSelectValue(toSelectValue(null), null)).toBeNull();
    expect(fromSelectValue(toSelectValue(""), "")).toBe("");
  });
});
