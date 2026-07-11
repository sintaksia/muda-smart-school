import { describe, it, expect } from "vitest";
import {
  bulkSiswaSchema,
  createSiswaSchema,
  updateSiswaCoreSchema,
} from "./SiswaSchema";

describe("createSiswaSchema", () => {
  const valid = {
    name: "Siti Aminah",
    email: "siti@example.com",
    password: "rahasia123",
    nis: "1001",
    nisn: "0012345678",
    programKeahlian: "TEKNIK_OTOMOTIF",
    angkatan: 2026,
  };

  it("accepts a valid payload", () => {
    const result = createSiswaSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects a non-10-digit NISN", () => {
    const result = createSiswaSchema.safeParse({ ...valid, nisn: "123" });
    expect(result.success).toBe(false);
  });
});

describe("updateSiswaCoreSchema", () => {
  it("accepts a partial update", () => {
    const result = updateSiswaCoreSchema.safeParse({ angkatan: 2025 });
    expect(result.success).toBe(true);
    expect(result.data?.angkatan).toBe(2025);
  });

  it("rejects an invalid status", () => {
    const result = updateSiswaCoreSchema.safeParse({ status: "UNKNOWN" });
    expect(result.success).toBe(false);
  });
});

describe("bulkSiswaSchema", () => {
  it("requires targetKelasId for PROMOTE", () => {
    const result = bulkSiswaSchema.safeParse({
      action: "PROMOTE",
      studentIds: ["s1"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts GRADUATE without a target class", () => {
    const result = bulkSiswaSchema.safeParse({
      action: "GRADUATE",
      studentIds: ["s1", "s2"],
    });
    expect(result.success).toBe(true);
  });
});
