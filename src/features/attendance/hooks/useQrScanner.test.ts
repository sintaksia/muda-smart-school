import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useQrScanner } from "./useQrScanner";

const detect = vi.fn();
const stopTrack = vi.fn();

function installBarcodeDetector(): void {
  (window as unknown as { BarcodeDetector?: unknown }).BarcodeDetector = class {
    detect = detect;
  };
}

function installCamera(): void {
  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value: true,
  });
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: stopTrack }],
      }),
    },
  });
}

/** Attach a stub video element so the hook's play()/srcObject calls work. */
function attachVideo(ref: React.RefObject<HTMLVideoElement | null>): void {
  ref.current = {
    play: vi.fn().mockResolvedValue(undefined),
    srcObject: null,
  } as unknown as HTMLVideoElement;
}

beforeEach(() => {
  vi.clearAllMocks();
  installBarcodeDetector();
  installCamera();
});

afterEach(() => {
  delete (window as unknown as { BarcodeDetector?: unknown }).BarcodeDetector;
});

describe("useQrScanner", () => {
  it("reports a detected code and stops the camera in single-shot mode", async () => {
    detect.mockResolvedValue([{ rawValue: "tok-1" }]);
    const onDetect = vi.fn();

    const { result } = renderHook(() => useQrScanner({ onDetect }));
    attachVideo(result.current.videoRef);

    await act(async () => {
      await result.current.start();
    });

    await waitFor(() => expect(onDetect).toHaveBeenCalledWith("tok-1"));
    await waitFor(() => expect(result.current.scanning).toBe(false));
    expect(stopTrack).toHaveBeenCalled();
  });

  it("keeps scanning and ignores the same code twice within the cooldown", async () => {
    detect.mockResolvedValue([{ rawValue: "tok-1" }]);
    const onDetect = vi.fn();

    const { result } = renderHook(() =>
      useQrScanner({ onDetect, continuous: true, cooldownMs: 10_000 }),
    );
    attachVideo(result.current.videoRef);

    await act(async () => {
      await result.current.start();
    });

    await waitFor(() => expect(onDetect).toHaveBeenCalledTimes(1));
    // Camera stays open for the next card.
    expect(result.current.scanning).toBe(true);
    // Several more poll cycles pass without a second callback for the same code.
    await new Promise((resolve) => setTimeout(resolve, 900));
    expect(onDetect).toHaveBeenCalledTimes(1);

    act(() => result.current.stop());
  });

  it("releases the camera when no preview element ever mounts", async () => {
    const onDetect = vi.fn();

    const { result } = renderHook(() => useQrScanner({ onDetect }));
    // videoRef is left null: the caller never rendered a <video>.

    let started = true;
    await act(async () => {
      started = await result.current.start();
    });

    expect(started).toBe(false);
    expect(stopTrack).toHaveBeenCalled();
    await waitFor(() => expect(result.current.scanning).toBe(false));
  }, 10_000);

  it("explains why the camera is blocked on an insecure origin", async () => {
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: false,
    });
    const onDetect = vi.fn();

    const { result } = renderHook(() => useQrScanner({ onDetect }));

    let message = "";
    await act(async () => {
      await result.current.start().catch((error: Error) => {
        message = error.message;
      });
    });

    expect(message).toMatch(/HTTPS/);
    await waitFor(() => expect(result.current.supported).toBe(false));
    expect(result.current.scanning).toBe(false);
    expect(onDetect).not.toHaveBeenCalled();
  });
});
