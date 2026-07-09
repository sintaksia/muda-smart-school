import { describe, it, expect } from "vitest";
import { generateQrToken, isQrTokenExpired } from "./qr";

describe("generateQrToken", () => {
  it("generates unique URL-safe tokens", () => {
    const a = generateQrToken();
    const b = generateQrToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThanOrEqual(32);
  });
});

describe("isQrTokenExpired", () => {
  const now = new Date("2026-07-09T01:00:00.000Z");

  it("never expires in STATIC mode", () => {
    expect(
      isQrTokenExpired("STATIC", new Date("2026-07-09T00:00:00.000Z"), 45, now),
    ).toBe(false);
  });

  it("expires after the TTL in DYNAMIC mode", () => {
    const issuedAt = new Date(now.getTime() - 46 * 1000);
    expect(isQrTokenExpired("DYNAMIC", issuedAt, 45, now)).toBe(true);
  });

  it("stays valid within the TTL in DYNAMIC mode", () => {
    const issuedAt = new Date(now.getTime() - 30 * 1000);
    expect(isQrTokenExpired("DYNAMIC", issuedAt, 45, now)).toBe(false);
  });

  it("treats a missing issuedAt as expired in DYNAMIC mode", () => {
    expect(isQrTokenExpired("DYNAMIC", null, 45, now)).toBe(true);
  });
});
