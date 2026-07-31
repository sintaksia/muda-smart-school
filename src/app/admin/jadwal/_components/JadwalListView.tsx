"use client";

import { Trash2, TriangleAlert } from "lucide-react";
import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_VALUES } from "@/src/lib/constants";
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
      {DAY_OF_WEEK_VALUES.map((dayOfWeek) => {
        const rows = jadwal.filter((row) => row.dayOfWeek === dayOfWeek);
        if (rows.length === 0) {
          return null;
        }
        return (
          <section
            key={dayOfWeek}
            className="border-border rounded-md border bg-white"
          >
            <header className="border-border flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-foreground text-base font-semibold">
                {DAY_OF_WEEK_LABELS[dayOfWeek]}
              </h3>
              <span className="text-muted-foreground text-xs font-medium">
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
                        className={`border-border border-b last:border-b-0 ${
                          isConflict ? "bg-destructive/5" : ""
                        }`}
                      >
                        <td className="text-foreground w-32 px-5 py-3 font-semibold tabular-nums">
                          {row.startTime}–{row.endTime}
                        </td>
                        <td className="text-foreground px-4 py-3">
                          <span className="flex items-center gap-2">
                            {row.subjectName}
                            {isConflict && (
                              <span className="text-destructive flex items-center gap-1 text-xs font-semibold">
                                <TriangleAlert
                                  className="h-4 w-4"
                                  strokeWidth={1.75}
                                />
                                Bentrok
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="text-neutral-600 px-4 py-3">
                          {row.className}
                        </td>
                        <td className="text-neutral-600 px-4 py-3">
                          {row.teacherName}
                        </td>
                        <td className="w-16 px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onDelete(row.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
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
        <div className="border-border rounded-md text-muted-foreground border bg-white px-5 py-12 text-center text-sm">
          Tidak ada jadwal yang cocok dengan filter.
        </div>
      )}
    </div>
  );
}
