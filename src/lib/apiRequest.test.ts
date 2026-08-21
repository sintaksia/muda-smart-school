import { describe, it, expect, vi, afterEach } from "vitest";
import { apiRequest } from "./apiRequest";

function mockFetch(
  response: Partial<Response> & { json: () => Promise<unknown> },
): void {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("returns the parsed body on success", async () => {
    mockFetch({ ok: true, json: async () => ({ id: "abc" }) });

    await expect(
      apiRequest("/api/master/classes", "POST", { name: "X" }),
    ).resolves.toEqual({
      id: "abc",
    });
    expect(fetch).toHaveBeenCalledWith("/api/master/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X" }),
    });
  });

  it("omits the body and content-type when no body is given", async () => {
    mockFetch({ ok: true, json: async () => null });

    await apiRequest("/api/master/classes/1", "DELETE");

    expect(fetch).toHaveBeenCalledWith("/api/master/classes/1", {
      method: "DELETE",
      headers: undefined,
      body: undefined,
    });
  });

  it("throws the route's error message on a failed response", async () => {
    mockFetch({
      ok: false,
      json: async () => ({ error: "Nama sudah dipakai" }),
    });

    await expect(apiRequest("/api/master/classes", "POST", {})).rejects.toThrow(
      "Nama sudah dipakai",
    );
  });

  it("falls back to the given message when the body has no error field", async () => {
    mockFetch({ ok: false, json: async () => ({}) });

    await expect(
      apiRequest("/api/master/classes", "POST", {}, "Gagal membuat kelas"),
    ).rejects.toThrow("Gagal membuat kelas");
  });

  it("falls back when the response body is not JSON", async () => {
    mockFetch({
      ok: false,
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    });

    await expect(
      apiRequest("/api/master/classes", "POST", {}, "Gagal membuat kelas"),
    ).rejects.toThrow("Gagal membuat kelas");
  });
});
