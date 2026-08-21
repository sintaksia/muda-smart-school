"use client";

import { Loader2, Undo2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/app/admin/_components/Badge";
import { formatTanggal } from "@/src/lib/date";
import type { PromotionBatchRow } from "@/src/features/master/types";

interface PromotionHistoryTableProps {
  batches: PromotionBatchRow[];
  revertingId: string | null;
  onRevert: (batchId: string) => void;
}

export function PromotionHistoryTable({
  batches,
  revertingId,
  onRevert,
}: PromotionHistoryTableProps) {
  const newestActiveId = batches.find((batch) => !batch.revertedAt)?.id ?? null;

  return (
    <section className="border-border rounded-md border bg-white">
      <h2 className="border-border text-foreground border-b px-5 py-3 text-base font-semibold">
        Riwayat Kenaikan Kelas
      </h2>
      {batches.length === 0 ? (
        <p className="text-muted-foreground px-5 py-6 text-sm">
          Belum ada kenaikan kelas yang pernah dijalankan.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs font-semibold uppercase tracking-wide">
                <th className="px-5 py-3">Tahun Ajaran</th>
                <th className="px-4 py-3">Rincian</th>
                <th className="px-4 py-3">Dijalankan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr
                  key={batch.id}
                  className="border-border border-b last:border-b-0"
                >
                  <td className="text-foreground px-5 py-3 font-semibold tabular-nums">
                    {batch.fromAcademicYear} → {batch.toAcademicYear}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 tabular-nums">
                    {batch.promotedCount} naik · {batch.retainedCount} tinggal ·{" "}
                    {batch.graduatedCount} lulus · {batch.exitedCount} keluar
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatTanggal(batch.createdAt)}
                    {batch.executedByName && ` · ${batch.executedByName}`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {batch.revertedAt ? (
                      <Badge variant="secondary">Dibatalkan</Badge>
                    ) : batch.id === newestActiveId ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onRevert(batch.id)}
                        disabled={revertingId !== null}
                        className="hover:bg-muted h-8"
                      >
                        {revertingId === batch.id ? (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Undo2 className="mr-2 h-3.5 w-3.5" />
                        )}
                        Batalkan
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
