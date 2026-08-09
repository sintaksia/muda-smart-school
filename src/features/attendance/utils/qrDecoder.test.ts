import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createQrDecoder, getCameraBlockReason } from "./qrDecoder";

const jsQR = vi.fn();
vi.mock("jsqr", () => ({ default: (...args: unknown[]) => jsQR(...args) }));

function setSecureContext(value: boolean): void {
  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value,
  });
}

function setCamera(present: boolean): void {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: present ? { getUserMedia: vi.fn() } : undefined,
  });
}

function fakeVideo(width: number, height: number): HTMLVideoElement {
  return { videoWidth: width, videoHeight: height } as HTMLVideoElement;
}

beforeEach(() => {
  vi.clearAllMocks();
  setSecureContext(true);
  setCamera(true);
});

afterEach(() => {
  delete (window as unknown as { BarcodeDetector?: unknown }).BarcodeDetector;
});

describe("createQrDecoder", () => {
  it("uses the native BarcodeDetector when the browser has one", async () => {
    const detect = vi.fn().mockResolvedValue([{ rawValue: "native-1" }]);
    (window as unknown as { BarcodeDetector?: unknown }).BarcodeDetector =
      class {
        detect = detect;
      };

    const decode = await createQrDecoder();

    expect(await decode(fakeVideo(10, 10))).toBe("native-1");
    expect(jsQR).not.toHaveBeenCalled();
  });

  it("falls back to jsQR when BarcodeDetector is missing", async () => {
    const context = {
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    jsQR.mockReturnValue({ data: "fallback-1" });

    const decode = await createQrDecoder();

    expect(await decode(fakeVideo(320, 240))).toBe("fallback-1");
    expect(context.drawImage).toHaveBeenCalled();
  });

  it("returns nothing while the video has no frame yet", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
      getImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

    const decode = await createQrDecoder();

    expect(await decode(fakeVideo(0, 0))).toBeUndefined();
    expect(jsQR).not.toHaveBeenCalled();
  });
});

describe("getCameraBlockReason", () => {
  it("passes on a secure context with a camera", () => {
    expect(getCameraBlockReason()).toBeUndefined();
  });

  it("points at HTTPS on an insecure origin", () => {
    setSecureContext(false);
    expect(getCameraBlockReason()).toMatch(/HTTPS/);
  });

  it("reports a browser without camera access", () => {
    setCamera(false);
    expect(getCameraBlockReason()).toMatch(/kamera/i);
  });
});
