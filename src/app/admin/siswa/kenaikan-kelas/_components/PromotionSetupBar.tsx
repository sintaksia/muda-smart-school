"use client";

import { Loader2, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ADMIN_FIELD_CLASS } from "@/src/components/common/formClasses";
import { ENTITY_LABELS } from "@/src/lib/constants";

interface PromotionSetupBarProps {
  fromAcademicYear: string;
  toAcademicYear: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onLoadPreview: () => void;
  onPrepareClasses: () => void;
  loadingPreview: boolean;
  preparingClasses: boolean;
  /** Destination classes found for the target year, once a preview has loaded. */
  targetClassCount: number | null;
}

export function PromotionSetupBar({
  fromAcademicYear,
  toAcademicYear,
  onFromChange,
  onToChange,
  onLoadPreview,
  onPrepareClasses,
  loadingPreview,
  preparingClasses,
  targetClassCount,
}: PromotionSetupBarProps) {
  return (
    <section className="border-border space-y-3 rounded-md border bg-white p-5">
      <h2 className="text-foreground text-base font-semibold">
        Tahun Ajaran
      </h2>
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="text-muted-foreground text-xs font-semibold">
            Dari
          </span>
          <Input
            value={fromAcademicYear}
            onChange={(event) => onFromChange(event.target.value)}
            placeholder="2025/2026"
            pattern="\d{4}/\d{4}"
            className={`${ADMIN_FIELD_CLASS} w-36 tabular-nums`}
          />
        </label>
        <label className="space-y-1">
          <span className="text-muted-foreground text-xs font-semibold">
            Ke
          </span>
          <Input
            value={toAcademicYear}
            onChange={(event) => onToChange(event.target.value)}
            placeholder="2026/2027"
            pattern="\d{4}/\d{4}"
            className={`${ADMIN_FIELD_CLASS} w-36 tabular-nums`}
          />
        </label>
        <Button type="button" onClick={onLoadPreview} disabled={loadingPreview}>
          {loadingPreview ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {loadingPreview ? "Memuat..." : "Muat Pratinjau"}
        </Button>
      </div>

      {targetClassCount === 0 && (
        <div className="border-border bg-muted flex flex-wrap items-center gap-3 rounded-sm border p-3">
          <p className="text-foreground text-sm">
            Belum ada {ENTITY_LABELS.CLASS.toLowerCase()} untuk{" "}
            <span className="font-semibold tabular-nums">{toAcademicYear}</span>.
            Siapkan dulu supaya ada kelas tujuan yang bisa dipilih.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onPrepareClasses}
            disabled={preparingClasses}
            className="ml-auto"
          >
            {preparingClasses ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {preparingClasses ? "Menyiapkan..." : "Siapkan Kelas TA Baru"}
          </Button>
        </div>
      )}
    </section>
  );
}
