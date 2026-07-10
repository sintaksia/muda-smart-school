"use client";

import { Trash2, TriangleAlert } from "lucide-react";
import { HARI_LABELS, HARI_VALUES } from "@/src/lib/constants";
import type { JadwalEntry } from "@/src/features/attendance/utils/jadwalGrid";

interface JadwalListViewProps {
  jadwal: JadwalEntry[];
  conflictIds: Set<string>;
  onDelete: (id: string) => void;
}

export function JadwalListView({
  jadwal,
  conflictIds,
  onDelete,
}: JadwalListViewProps) {
  return (
    <div className="space-y-6">
      {HARI_VALUES.map((hari) => {
        const rows = jadwal.filter((row) => row.hari === hari);
        if (rows.length === 0) {
          return null;
        }
        return (
          <section
            key={hari}
            className="border-hairline rounded-card border bg-white"
          >
            <header className="border-hairline flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-ink text-base font-semibold">
                {HARI_LABELS[hari]}
              </h3>
              <span className="text-ink-muted text-xs font-medium">
                {rows.length} sesi
              </span>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((row) => {
                    const isConflict = conflictIds.has(row.id);
                    return (
                      <tr
                        key={row.id}
                        className={`border-hairline border-b last:border-b-0 ${
                          isConflict ? "bg-danger/5" : ""
                        }`}
                      >
                        <td className="text-ink w-32 px-5 py-3 font-semibold tabular-nums">
                          {row.jamMulai}–{row.jamSelesai}
                        </td>
                        <td className="text-ink px-4 py-3">
                          <span className="flex items-center gap-2">
                            {row.mataPelajaran}
                            {isConflict && (
                              <span className="text-danger flex items-center gap-1 text-xs font-semibold">
                                <TriangleAlert
                                  className="h-4 w-4"
                                  strokeWidth={1.75}
                                />
                                Bentrok
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="text-ink-secondary px-4 py-3">
                          {row.kelas}
                        </td>
                        <td className="text-ink-secondary px-4 py-3">
                          {row.guru}
                        </td>
                        <td className="w-16 px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onDelete(row.id)}
                            className="text-ink-muted hover:text-danger transition-colors"
                            aria-label="Nonaktifkan jadwal"
                          >
                            <Trash2 className="h-5 w-5" strokeWidth={1.75} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {jadwal.length === 0 && (
        <div className="border-hairline rounded-card text-ink-muted border bg-white px-5 py-12 text-center text-sm">
          Tidak ada jadwal yang cocok dengan filter.
        </div>
      )}
    </div>
  );
}
