import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { startScannerWithFeedback } from "./startScannerWithFeedback";

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("startScannerWithFeedback", () => {
  it("stays quiet when the camera starts", async () => {
    await startScannerWithFeedback(async () => true, "masukkan kode manual");

    expect(toast.info).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("surfaces the block reason together with the manual fallback", async () => {
    await startScannerWithFeedback(async () => {
      throw new Error("Kamera hanya bisa dipakai lewat HTTPS");
    }, "masukkan NIS manual");

    expect(toast.error).toHaveBeenCalledWith(
      "Kamera hanya bisa dipakai lewat HTTPS — masukkan NIS manual.",
    );
  });

  it("hints at manual entry when the camera simply did not open", async () => {
    await startScannerWithFeedback(async () => false, "masukkan kode manual");

    expect(toast.info).toHaveBeenCalledWith(
      "Kamera belum siap — masukkan kode manual.",
    );
  });
});
