import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleApiError } from "./api-error";

describe("handleApiError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("returns 400 with validation details for a ZodError", async () => {
    const zodError = Object.assign(new Error("Invalid"), { name: "ZodError" });

    const response = handleApiError(
      zodError,
      "Error creating x:",
      "Gagal membuat x",
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Data tidak valid");
  });

  it("returns 500 with the fallback message for any other error", async () => {
    const response = handleApiError(
      new Error("db down"),
      "Error creating x:",
      "Gagal membuat x",
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Gagal membuat x");
  });
});
