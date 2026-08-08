"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface BarcodeDetectorResult {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect: (source: CanvasImageSource) => Promise<BarcodeDetectorResult[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats: string[] }): BarcodeDetectorInstance;
}

const POLL_INTERVAL_MS = 400;

export interface UseQrScannerOptions {
  /** Called with the decoded value of each accepted frame. */
  onDetect: (value: string) => void | Promise<void>;
  /** Keep the camera running after a hit, for scanning many codes in a row. */
  continuous?: boolean;
  /** In continuous mode, ignore the same value again within this window. */
  cooldownMs?: number;
}

export interface UseQrScanner {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  scanning: boolean;
  /** False when the browser has no BarcodeDetector — callers offer manual entry. */
  supported: boolean;
  /** Resolves false when the browser cannot scan; throws if the camera is denied. */
  start: () => Promise<boolean>;
  stop: () => void;
}

function getDetectorCtor(): BarcodeDetectorConstructor | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor })
    .BarcodeDetector;
}

/**
 * Camera QR scanning on the native BarcodeDetector API — no bundled decoder.
 * Shared by the student scanning the session QR and the teacher scanning
 * student ID cards, which differ only in `continuous`.
 */
export function useQrScanner({
  onDetect,
  continuous = false,
  cooldownMs = 2500,
}: UseQrScannerOptions): UseQrScanner {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastHitRef = useRef<{ value: string; at: number } | null>(null);
  const onDetectRef = useRef(onDetect);
  const [scanning, setScanning] = useState<boolean>(false);
  const [supported, setSupported] = useState<boolean>(true);

  // Keep the latest callback without restarting the camera loop.
  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  const stop = useCallback((): void => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    lastHitRef.current = null;
    setScanning(false);
  }, []);

  // Support is probed on the first start() rather than on mount: reading it
  // during render would differ between server and client.
  useEffect(() => stop, [stop]);

  const start = useCallback(async (): Promise<boolean> => {
    const DetectorCtor = getDetectorCtor();
    if (!DetectorCtor) {
      setSupported(false);
      return false;
    }
    if (streamRef.current) {
      return true;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    streamRef.current = stream;
    setScanning(true);

    const video = videoRef.current;
    if (!video) {
      return false;
    }
    video.srcObject = stream;
    await video.play();

    const detector = new DetectorCtor({ formats: ["qr_code"] });
    const tick = async (): Promise<void> => {
      if (!streamRef.current) {
        return;
      }
      try {
        const codes = await detector.detect(video);
        const value = codes[0]?.rawValue;
        if (value && !isOnCooldown(value)) {
          lastHitRef.current = { value, at: Date.now() };
          await onDetectRef.current(value);
          if (!continuous) {
            stop();
            return;
          }
        }
      } catch {
        // Detection can fail on individual frames; keep polling.
      }
      setTimeout(() => void tick(), POLL_INTERVAL_MS);
    };

    function isOnCooldown(value: string): boolean {
      const last = lastHitRef.current;
      return (
        last !== null &&
        last.value === value &&
        Date.now() - last.at < cooldownMs
      );
    }

    void tick();
    return true;
  }, [continuous, cooldownMs, stop]);

  return { videoRef, scanning, supported, start, stop };
}
