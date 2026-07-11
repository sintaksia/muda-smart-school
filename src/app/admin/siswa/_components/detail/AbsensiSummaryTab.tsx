"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { absensiStatusOptions } from "@/src/lib/constants";
import type { SiswaDetailData } from "./SiswaDetail";

interface AbsensiSummaryTabProps {
  absensiSummary: SiswaDetailData["absensiSummary"];
}

export function AbsensiSummaryTab({ absensiSummary }: AbsensiSummaryTabProps) {
  const counts = Object.fromEntries(
    absensiSummary.map((entry) => [entry.status, entry._count]),
  );
  const total = absensiSummary.reduce((sum, entry) => sum + entry._count, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {absensiStatusOptions.map((option) => (
          <Card key={option.value}>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-muted-foreground">
                {option.label}
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {counts[option.value] ?? 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Total {total} catatan absensi.
      </p>
    </div>
  );
}
