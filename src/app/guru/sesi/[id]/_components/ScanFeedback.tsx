"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";

export interface ScanOutcome {
  tone: "success" | "muted" | "error";
  title: string;
  detail?: string;
}

const TONE_STYLES: Record<ScanOutcome["tone"], string> = {
  success: "border-green-600 bg-green-600/10 text-green-700",
  muted: "border-border bg-muted text-neutral-600",
  error: "border-destructive bg-destructive/10 text-destructive",
};

const TONE_ICONS: Record<ScanOutcome["tone"], typeof CheckCircle2> = {
  success: CheckCircle2,
  muted: Info,
  error: XCircle,
};

/**
 * Result of the most recent card scan, sized to be readable at arm's length
 * while the teacher keeps scanning.
 */
export function ScanFeedback({ outcome }: { outcome: ScanOutcome | null }) {
  if (!outcome) {
    return (
      <p className="text-muted-foreground rounded-sm border border-dashed px-4 py-3 text-center text-sm">
        Arahkan kamera ke kartu siswa
      </p>
    );
  }

  const Icon = TONE_ICONS[outcome.tone];

  return (
    <div
      className={`rounded-sm flex items-center gap-3 border px-4 py-3 ${TONE_STYLES[outcome.tone]}`}
      role="status"
      aria-live="polite"
    >
      <Icon className="h-6 w-6 shrink-0" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="truncate text-base font-semibold">{outcome.title}</p>
        {outcome.detail && (
          <p className="truncate text-xs font-medium">{outcome.detail}</p>
        )}
      </div>
    </div>
  );
}
