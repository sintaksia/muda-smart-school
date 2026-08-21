"use client";

import { Badge } from "@/src/app/admin/_components/Badge";
import { attendanceStatusOptions } from "@/src/lib/constants";
import { cn } from "@/src/lib/utils";
import { useRecapFilter } from "./useRecapFilter";

interface StudentAttendanceSummaryProps {
  /** Record count per status for the selected day, ignoring the status filter. */
  counts: Record<string, number>;
  activeStatus: string;
}

/**
 * Day recap tiles. Each tile doubles as the status filter — clicking the one
 * already selected clears it, so the tiles and the filter bar never disagree.
 */
export function StudentAttendanceSummary({
  counts,
  activeStatus,
}: StudentAttendanceSummaryProps) {
  const setParam = useRecapFilter();
  const total = attendanceStatusOptions.reduce(
    (sum, option) => sum + (counts[option.value] ?? 0),
    0,
  );

  return (
    <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {attendanceStatusOptions.map((option) => {
        const isActive = activeStatus === option.value;
        const count = counts[option.value] ?? 0;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setParam("status", isActive ? "" : option.value)}
            aria-pressed={isActive}
            className={cn(
              "border-border flex flex-col gap-2 rounded-md border bg-white p-4 text-left transition hover:shadow-sm",
              isActive && "border-primary-500 ring-primary-500/30 ring-2",
            )}
          >
            <Badge variant={option.badge}>{option.label}</Badge>
            <span className="text-foreground text-2xl font-bold tabular-nums">
              {count}
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {total > 0 ? `${Math.round((count / total) * 100)}% dari ${total}` : "Belum ada data"}
            </span>
          </button>
        );
      })}
    </section>
  );
}
