interface BarcodeDetectorResult {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect: (source: CanvasImageSource) => Promise<BarcodeDetectorResult[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats: string[] }): BarcodeDetectorInstance;
}

/** Reads one frame of a live video element and returns the QR payload. */
export type QrDecoder = (
  video: HTMLVideoElement,
) => Promise<string | undefined>;

function getDetectorCtor(): BarcodeDetectorConstructor | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor })
    .BarcodeDetector;
}

function createNativeDecoder(Ctor: BarcodeDetectorConstructor): QrDecoder {
  const detector = new Ctor({ formats: ["qr_code"] });
  return async (video) => (await detector.detect(video))[0]?.rawValue;
}

/**
 * Canvas + jsQR fallback for browsers without BarcodeDetector (Chrome on iOS,
 * Safari, Firefox, and any Chromium build where the API is unavailable).
 */
async function createFallbackDecoder(): Promise<QrDecoder> {
  const { default: jsQR } = await import("jsqr");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Canvas tidak tersedia untuk memindai QR");
  }

  return async (video) => {
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      return undefined;
    }
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);
    const { data } = context.getImageData(0, 0, width, height);
    const result = jsQR(data, width, height, {
      inversionAttempts: "dontInvert",
    });
    return result?.data;
  };
}

/**
 * Native BarcodeDetector when the browser has it, jsQR otherwise — so scanning
 * never depends on a single vendor API.
 */
export async function createQrDecoder(): Promise<QrDecoder> {
  const Ctor = getDetectorCtor();
  return Ctor ? createNativeDecoder(Ctor) : createFallbackDecoder();
}

/**
 * Cameras are gated behind a secure context: over plain http (a LAN IP in
 * dev, for instance) `navigator.mediaDevices` is simply absent.
 */
export function getCameraBlockReason(): string | undefined {
  if (typeof window === "undefined") {
    return "Kamera hanya tersedia di browser";
  }
  if (!window.isSecureContext) {
    return "Kamera hanya bisa dipakai lewat HTTPS (atau localhost). Buka situs ini dengan https://";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "Browser ini tidak mengizinkan akses kamera";
  }
  return undefined;
}
