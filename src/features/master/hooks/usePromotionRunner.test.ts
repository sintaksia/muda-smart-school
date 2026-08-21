import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { usePromotionRunner } from "./usePromotionRunner";
import type { PromotionInput } from "../types";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const fetchMock = vi.fn();

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response;
}

const plan: PromotionInput = {
  fromAcademicYear: "2025/2026",
  toAcademicYear: "2026/2027",
  entries: [{ studentId: "s1", action: "PROMOTE", targetClassId: "c11" }],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadPreview", () => {
  it("stores the preview it fetched", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ classes: [], targetClasses: [] }));
    const { result } = renderHook(() => usePromotionRunner());

    await act(async () => {
      await result.current.loadPreview("2025/2026", "2026/2027");
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/master/students/class-promotion?from=2025%2F2026&to=2026%2F2027",
    );
    expect(result.current.preview).toEqual({ classes: [], targetClasses: [] });
    expect(result.current.loadingPreview).toBe(false);
  });

  it("clears the preview and reports the server message on failure", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "Tahun ajaran tujuan harus berbeda" }, false),
    );
    const { result } = renderHook(() => usePromotionRunner());

    await act(async () => {
      await result.current.loadPreview("2025/2026", "2025/2026");
    });

    expect(result.current.preview).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      "Tahun ajaran tujuan harus berbeda",
    );
  });
});

describe("runPromotion", () => {
  it("reports success and drops the stale preview", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ batchId: "batch-1" }));
    const { result } = renderHook(() => usePromotionRunner());

    let ok = false;
    await act(async () => {
      ok = await result.current.runPromotion(plan);
    });

    expect(ok).toBe(true);
    expect(result.current.preview).toBeNull();
    expect(toast.success).toHaveBeenCalledWith("1 siswa berhasil diproses");
  });

  it("returns false and surfaces the error when the server rejects it", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "Ada siswa yang tidak ditemukan" }, false),
    );
    const { result } = renderHook(() => usePromotionRunner());

    let ok = true;
    await act(async () => {
      ok = await result.current.runPromotion(plan);
    });

    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Ada siswa yang tidak ditemukan");
    await waitFor(() => expect(result.current.running).toBe(false));
  });
});

describe("prepareClasses", () => {
  it("clones the classes then reloads the preview", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ created: 6, skipped: 0 }))
      .mockResolvedValueOnce(jsonResponse({ classes: [], targetClasses: [] }));
    const { result } = renderHook(() => usePromotionRunner());

    await act(async () => {
      await result.current.prepareClasses("2025/2026", "2026/2027");
    });

    expect(toast.success).toHaveBeenCalledWith("6 kelas dibuat untuk 2026/2027");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.preview).not.toBeNull();
  });

  it("does not reload the preview when cloning fails", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "Data tidak valid" }, false));
    const { result } = renderHook(() => usePromotionRunner());

    await act(async () => {
      await result.current.prepareClasses("2025/2026", "2026/2027");
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith("Data tidak valid");
  });
});

describe("revertBatch", () => {
  it("reverts and clears the in-flight marker", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    const { result } = renderHook(() => usePromotionRunner());

    let ok = false;
    await act(async () => {
      ok = await result.current.revertBatch("batch-1");
    });

    expect(ok).toBe(true);
    expect(result.current.revertingId).toBeNull();
    expect(toast.success).toHaveBeenCalledWith("Kenaikan kelas dibatalkan");
  });

  it("reports a refusal from the server", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "Hanya proses kenaikan terakhir yang dapat dibatalkan" }, false),
    );
    const { result } = renderHook(() => usePromotionRunner());

    let ok = true;
    await act(async () => {
      ok = await result.current.revertBatch("batch-1");
    });

    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Hanya proses kenaikan terakhir yang dapat dibatalkan",
    );
  });
});
