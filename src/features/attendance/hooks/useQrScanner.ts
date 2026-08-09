"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createQrDecoder,
  getCameraBlockReason,
} from "@/src/features/attendance/utils/qrDecoder";

const POLL_INTERVAL_MS = 400;
const VIDEO_WAIT_TRIES = 20;
const VIDEO_WAIT_MS = 50;

/**
 * The preview may still be mounting when the stream arrives (a caller that
 * renders the <video> only while scanning), so give React a few frames.
 */
async function waitForVideo(
  ref: React.RefObject<HTMLVideoElement | null>,
): Promise<HTMLVideoElement | null> {
  for (let attempt = 0; attempt < VIDEO_WAIT_TRIES; attempt += 1) {
    if (ref.current) {
      return ref.current;
    }
    await new Promise((resolve) => setTimeout(resolve, VIDEO_WAIT_MS));
  }
  return ref.current;
}

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
  /** False when the camera itself is unavailable — callers offer manual entry. */
  supported: boolean;
  /**
   * Resolves false when the camera cannot be used at all; throws with a
   * human-readable message when it is blocked or denied.
   */
  start: () => Promise<boolean>;
  stop: () => void;
}

/**
 * Camera QR scanning, native BarcodeDetector where available and a jsQR
 * fallback everywhere else. Shared by the student scanning the session QR and
 * the teacher scanning student ID cards, which differ only in `continuous`.
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
    const blockReason = getCameraBlockReason();
    if (blockReason) {
      setSupported(false);
      throw new Error(blockReason);
    }
    if (streamRef.current) {
      return true;
    }

    const decode = await createQrDecoder();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    streamRef.current = stream;
    setScanning(true);

    const video = await waitForVideo(videoRef);
    if (!video) {
      // No preview element to read frames from — release the camera again.
      stop();
      return false;
    }
    video.srcObject = stream;
    await video.play();

    const tick = async (): Promise<void> => {
      if (!streamRef.current) {
        return;
      }
      try {
        const value = await decode(video);
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
