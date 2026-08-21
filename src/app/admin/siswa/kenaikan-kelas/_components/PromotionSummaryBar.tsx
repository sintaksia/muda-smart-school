"use client";

import { ArrowUpNarrowWide, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  PROMOTION_ACTION_BADGES,
  promotionActionOptions,
} from "@/src/lib/constants";
import type { PromotionAction } from "@prisma/client";

interface PromotionSummaryBarProps {
  counts: Record<PromotionAction, number>;
  totalStudents: number;
  incompleteCount: number;
  running: boolean;
  onRun: () => void;
}

export function PromotionSummaryBar({
  counts,
  totalStudents,
  incompleteCount,
  running,
  onRun,
}: PromotionSummaryBarProps) {
  return (
    <div className="border-border sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-md border bg-white p-4 shadow-sm">
      <span className="text-foreground text-sm font-semibold tabular-nums">
        {totalStudents} siswa
      </span>
      {promotionActionOptions.map((option) => (
        <Badge key={option.value} variant={PROMOTION_ACTION_BADGES[option.value]}>
          {option.label}: {counts[option.value as PromotionAction]}
        </Badge>
      ))}

      <div className="ml-auto flex items-center gap-3">
        {incompleteCount > 0 && (
          <span className="text-destructive text-xs font-semibold tabular-nums">
            {incompleteCount} siswa belum lengkap
          </span>
        )}
        <Button
          type="button"
          onClick={onRun}
          disabled={running || totalStudents === 0 || incompleteCount > 0}
        >
          {running ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpNarrowWide className="mr-2 h-4 w-4" />
          )}
          {running ? "Memproses..." : "Jalankan Kenaikan Kelas"}
        </Button>
      </div>
    </div>
  );
}
