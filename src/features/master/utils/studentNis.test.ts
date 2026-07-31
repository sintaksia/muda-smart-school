import { describe, it, expect } from "vitest";
import { fallbackStudentEmail, nextNis, pickStudentEmail } from "./studentNis";

describe("nextNis", () => {
  it("starts a new intake year at 001", () => {
    expect(nextNis(2026, [])).toBe("2026001");
  });

  it("continues after the highest NIS of that year", () => {
    expect(nextNis(2026, ["2026001", "2026007", "2026003"])).toBe("2026008");
  });

  it("ignores other years and legacy NIS formats", () => {
    expect(nextNis(2026, ["2025009", "8888", "282828282828282"])).toBe(
      "2026001",
    );
  });
});

describe("fallbackStudentEmail", () => {
  it("mints an address on the student domain", () => {
    expect(fallbackStudentEmail("2026001")).toBe("2026001@siswa.muda.sch.id");
  });
});

describe("pickStudentEmail", () => {
  const base = {
    nis: "2026001",
    sharedCount: 1,
    takenEmails: new Set<string>(),
  };

  it("uses the registration's own address when it identifies one person", () => {
    expect(
      pickStudentEmail({ ...base, registrationEmail: "Budi@Contoh.sch.id" }),
    ).toBe("budi@contoh.sch.id");
  });

  it("generates one when several registrations share the address", () => {
    expect(
      pickStudentEmail({
        ...base,
        registrationEmail: "smkmuh2.cibiru@gmail.com",
        sharedCount: 4,
      }),
    ).toBe("2026001@siswa.muda.sch.id");
  });

  it("generates one when the address already has a login", () => {
    expect(
      pickStudentEmail({
        ...base,
        registrationEmail: "budi@contoh.sch.id",
        takenEmails: new Set(["budi@contoh.sch.id"]),
      }),
    ).toBe("2026001@siswa.muda.sch.id");
  });

  it("generates one when the registration has no email at all", () => {
    expect(pickStudentEmail({ ...base, registrationEmail: null })).toBe(
      "2026001@siswa.muda.sch.id",
    );
  });
});
