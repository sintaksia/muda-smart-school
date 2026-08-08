"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Camera, IdCard } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ManualCodeForm } from "@/src/components/common/ManualCodeForm";
import { useQrScanner } from "@/src/features/attendance/hooks/useQrScanner";
import { ATTENDANCE_STATUS_LABELS, ENTITY_LABELS } from "@/src/lib/constants";
import { ScanFeedback, type ScanOutcome } from "./ScanFeedback";

interface CardScanPanelProps {
  sessionId: string;
  recorded: number;
  total: number;
  onChanged: () => Promise<void>;
}

interface CardScanResponse {
  ok?: boolean;
  duplicate?: boolean;
  status?: string;
  studentName?: string;
  nis?: string;
  error?: string;
}

/**
 * Teacher-side scanning: the camera stays open and each student's ID card is
 * read in turn, so the teacher sees who they are recording.
 */
export function CardScanPanel({
  sessionId,
  recorded,
  total,
  onChanged,
}: CardScanPanelProps) {
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);

  const submit = useCallback(
    async (body: { cardToken?: string; nis?: string }): Promise<void> => {
      try {
        const response = await fetch(
          `/api/attendance/sessions/${sessionId}/card-scan`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );
        const data = (await response.json()) as CardScanResponse;

        if (!response.ok || !data.ok) {
          setOutcome({ tone: "error", title: data.error ?? "Scan ditolak" });
          return;
        }
        setOutcome({
          tone: data.duplicate ? "muted" : "success",
          title: data.studentName ?? "-",
          detail: data.duplicate
            ? "Sudah tercatat sebelumnya"
            : `${ATTENDANCE_STATUS_LABELS[data.status ?? ""] ?? data.status} · ${data.nis ?? ""}`,
        });
        await onChanged();
      } catch {
        setOutcome({ tone: "error", title: "Terjadi kesalahan jaringan" });
      }
    },
    [sessionId, onChanged],
  );

  const onDetect = useCallback(
    (cardToken: string) => submit({ cardToken }),
    [submit],
  );

  const { videoRef, scanning, start, stop } = useQrScanner({
    onDetect,
    continuous: true,
  });

  async function handleStart(): Promise<void> {
    try {
      if (!(await start())) {
        toast.info(
          "Kamera pemindai tidak didukung browser ini — masukkan NIS manual.",
        );
      }
    } catch {
      toast.error("Tidak dapat mengakses kamera");
    }
  }

  return (
    <section className="border-border rounded-md border bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <IdCard className="text-primary-900 h-5 w-5" strokeWidth={1.75} />
          <h3 className="text-foreground text-base font-semibold">
            Scan Kartu {ENTITY_LABELS.STUDENT}
          </h3>
        </div>
        <span className="text-muted-foreground text-xs font-medium tabular-nums">
          {recorded}/{total} tercatat
        </span>
      </div>

      {scanning ? (
        <div className="space-y-3">
          <video
            ref={videoRef}
            className="rounded-sm aspect-video w-full bg-black object-cover"
            playsInline
            muted
          />
          <ScanFeedback outcome={outcome} />
          <Button
            type="button"
            variant="outline"
            onClick={stop}
            className="text-neutral-600 h-11 w-full font-semibold"
          >
            Selesai Scan
          </Button>
        </div>
      ) : (
        <>
          <Button
            type="button"
            onClick={handleStart}
            className="bg-green-600 hover:bg-green-500 active:bg-green-700 h-11 w-full font-semibold text-white"
          >
            <Camera className="h-5 w-5" strokeWidth={1.75} />
            Buka Kamera & Scan Kartu
          </Button>
          {outcome && (
            <div className="mt-3">
              <ScanFeedback outcome={outcome} />
            </div>
          )}
        </>
      )}

      <ManualCodeForm
        onSubmit={(nis) => submit({ nis })}
        placeholder="Kartu tertinggal? Ketik NIS"
        submitLabel="Catat"
      />
    </section>
  );
}
