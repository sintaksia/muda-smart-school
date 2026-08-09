"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, ScanLine } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ManualCodeForm } from "@/src/components/common/ManualCodeForm";
import { useQrScanner } from "@/src/features/attendance/hooks/useQrScanner";
import { ScannerViewport } from "@/src/features/attendance/components/ScannerViewport";
import { startScannerWithFeedback } from "@/src/features/attendance/utils/startScannerWithFeedback";

export function ScanCard() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const submitToken = useCallback(
    async (token: string): Promise<void> => {
      if (!token || submitting) {
        return;
      }
      setSubmitting(true);
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
        router.refresh();
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Terjadi kesalahan",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [router, submitting],
  );

  const { videoRef, scanning, start, stop } = useQrScanner({
    onDetect: submitToken,
  });

  async function handleStart(): Promise<void> {
    await startScannerWithFeedback(start, "masukkan kode manual");
  }

  return (
    <section className="border-border rounded-md border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <ScanLine className="text-primary-900 h-5 w-5" strokeWidth={1.75} />
        <h3 className="text-foreground text-base font-semibold">
          Scan Presensi
        </h3>
      </div>

      <ScannerViewport
        videoRef={videoRef}
        scanning={scanning}
        aspectClassName="aspect-square"
        cancelLabel="Batal"
        onCancel={stop}
      />
      {!scanning && (
        <Button
          type="button"
          onClick={handleStart}
          disabled={submitting}
          className="bg-green-600 hover:bg-green-500 active:bg-green-700 h-11 w-full font-semibold text-white"
        >
          <Camera className="h-5 w-5" strokeWidth={1.75} />
          Buka Kamera & Scan QR
        </Button>
      )}

      <ManualCodeForm
        onSubmit={submitToken}
        placeholder="Atau ketik kode dari layar guru"
        submitLabel="Kirim"
        disabled={submitting}
      />
    </section>
  );
}
