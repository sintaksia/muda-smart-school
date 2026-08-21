import { describe, expect, it } from "vitest";

import { ENTITY_LABELS } from "@/src/lib/constants";
import { LOGIN_EMAIL_PLACEHOLDER, loginAudiences } from "./constants";

describe("loginAudiences", () => {
  it("lists the three portal audiences with single-sourced labels", () => {
    expect(loginAudiences.map((a) => a.key)).toEqual([
      "TEACHER",
      "STUDENT",
      "PARENT",
    ]);
    expect(loginAudiences.map((a) => a.label)).toEqual([
      ENTITY_LABELS.TEACHER,
      ENTITY_LABELS.STUDENT,
      ENTITY_LABELS.PARENT,
    ]);
  });

  it("gives every audience a tagline, icon and distinct tint", () => {
    const tints = new Set(loginAudiences.map((a) => a.tileClass));
    expect(tints.size).toBe(loginAudiences.length);

    for (const audience of loginAudiences) {
      expect(audience.tagline.length).toBeGreaterThan(0);
      expect(audience.icon).toBeTruthy();
    }
  });

  it("keeps the email example on the school domain", () => {
    expect(LOGIN_EMAIL_PLACEHOLDER).toMatch(/@muda\.sch\.id$/);
  });
});
