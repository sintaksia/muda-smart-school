"use client";

import { Badge } from "@/src/app/admin/_components/Badge";
import {
  CREDIT_ENTRY_TYPE_BADGES,
  CREDIT_ENTRY_TYPE_LABELS,
} from "@/src/lib/constants";

export interface CreditData {
  total: number;
  entries: {
    id: string;
    type: string;
    category: string;
    points: number;
    note: string | null;
    source: string;
    createdAt: string;
    reportedBy: { name: string } | null;
  }[];
}

interface CreditHistoryProps {
  credit: CreditData;
}

export function CreditHistory({ credit }: CreditHistoryProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-md bg-gradient-to-br from-primary-900 to-primary-950 p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
          Skor Kredit Berjalan
        </p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight tabular-nums">
          {credit.total}
        </p>
      </section>

      <section className="border-border rounded-md border bg-white">
        <header className="border-border border-b px-5 py-4">
          <h3 className="text-foreground text-base font-semibold">
            Riwayat Entri
          </h3>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {credit.entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-border border-b last:border-b-0"
                >
                  <td className="px-5 py-3">
                    <Badge variant={CREDIT_ENTRY_TYPE_BADGES[entry.type]}>
                      {CREDIT_ENTRY_TYPE_LABELS[entry.type]}
                    </Badge>
                  </td>
                  <td className="text-foreground px-4 py-3">
                    {entry.category}
                  </td>
                  <td className="text-neutral-600 max-w-56 truncate px-4 py-3">
                    {entry.note ?? "—"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {new Date(entry.createdAt).toLocaleDateString("id-ID")} ·{" "}
                    {entry.source === "AUTO"
                      ? "Otomatis"
                      : (entry.reportedBy?.name ?? "Manual")}
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-semibold tabular-nums ${
                      entry.points < 0 ? "text-destructive" : "text-green-600"
                    }`}
                  >
                    {entry.points > 0 ? `+${entry.points}` : entry.points}
                  </td>
                </tr>
              ))}
              {credit.entries.length === 0 && (
                <tr>
                  <td className="text-muted-foreground px-5 py-8 text-center">
                    Belum ada entri.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
