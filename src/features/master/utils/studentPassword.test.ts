import { describe, it, expect } from "vitest";
import { defaultStudentPassword } from "./studentPassword";

describe("defaultStudentPassword", () => {
  it("derives a policy-compliant password from the NIS", () => {
    const password = defaultStudentPassword("2024001");

    expect(password).toBe("Siswa2024001");
    expect(password.length).toBeGreaterThanOrEqual(8);
    expect(password).toMatch(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/);
  });

  it("pads a short or non-numeric NIS so the policy still holds", () => {
    expect(defaultStudentPassword("A-7")).toBe("Siswa0007");
    expect(defaultStudentPassword("")).toBe("Siswa0000");
  });
});
