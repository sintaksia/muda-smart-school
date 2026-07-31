"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, ScanLine } from "lucide-react";

interface BarcodeDetectorResult {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect: (source: CanvasImageSource) => Promise<BarcodeDetectorResult[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats: string[] }): BarcodeDetectorInstance;
}

export function ScanCard() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [manualToken, setManualToken] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function stopCamera(): void {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function submitToken(token: string): Promise<void> {
    if (!token || submitting) {
      return;
    }
    setSubmitting(true);
    stopCamera();
    try {
      const position = await new Promise<GeolocationPosition | null>(
        (resolve) => {
          if (!navigator.geolocation) {
            resolve(null);
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 5000 },
          );
        },
      );

      const response = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          gpsLat: position?.coords.latitude,
          gpsLng: position?.coords.longitude,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal mencatat presensi");
      }
      toast.success(
        data.status === "PRESENT"
          ? "Presensi tercatat: Hadir"
          : `Presensi tercatat: ${data.status}`,
      );
      if (data.needsReview) {
        toast.warning("GPS di luar radius — menunggu konfirmasi guru");
      }
      setManualToken("");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  async function startCamera(): Promise<void> {
    const DetectorCtor = (
      window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }
    ).BarcodeDetector;
    if (!DetectorCtor) {
      toast.info(
        "Kamera pemindai tidak didukung browser ini — masukkan kode manual.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScanning(true);
      const video = videoRef.current;
      if (!video) {
        return;
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
          if (codes.length > 0) {
            await submitToken(codes[0].rawValue);
            return;
          }
        } catch {
          // detection can fail on some frames; keep polling
        }
        setTimeout(() => void tick(), 400);
      };
      void tick();
    } catch {
      toast.error("Tidak dapat mengakses kamera");
      stopCamera();
    }
  }

  return (
    <section className="border-border rounded-md border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <ScanLine className="text-primary-900 h-5 w-5" strokeWidth={1.75} />
        <h3 className="text-foreground text-base font-semibold">
          Scan Presensi
        </h3>
      </div>

      {scanning ? (
        <div className="space-y-3">
          <video
            ref={videoRef}
            className="rounded-sm aspect-square w-full bg-black object-cover"
            playsInline
            muted
          />
          <button
            type="button"
            onClick={stopCamera}
            className="border-neutral-300 text-neutral-600 rounded-sm h-11 w-full border text-sm font-semibold"
          >
            Batal
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startCamera}
          disabled={submitting}
          className="bg-green-600 hover:bg-green-500 active:bg-green-700 rounded-sm inline-flex h-11 w-full items-center justify-center gap-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
        >
          <Camera className="h-5 w-5" strokeWidth={1.75} />
          Buka Kamera & Scan QR
        </button>
      )}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submitToken(manualToken.trim());
        }}
      >
        <input
          type="text"
          value={manualToken}
          onChange={(event) => setManualToken(event.target.value)}
          placeholder="Atau ketik kode dari layar guru"
          className="border-neutral-300 text-foreground rounded-sm h-11 flex-1 border bg-white px-3 font-mono text-sm"
        />
        <button
          type="submit"
          disabled={submitting || manualToken.trim().length === 0}
          className="bg-primary-900 hover:bg-primary-800 active:bg-primary-950 rounded-sm h-11 px-5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
        >
          {submitting ? "..." : "Kirim"}
        </button>
      </form>
    </section>
  );
}
