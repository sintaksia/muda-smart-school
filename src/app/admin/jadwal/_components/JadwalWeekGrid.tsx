"use client";

import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_VALUES } from "@/src/lib/constants";
import { parseTimeToMinutes } from "@/src/features/attendance/utils/time";
import {
  buildTimeBoundaries,
  type JadwalEntry,
} from "@/src/features/attendance/utils/jadwalGrid";
import { FREE_SLOT_CLASS, GAP_HIGHLIGHT_CLASS } from "./jadwalStyles";

interface JadwalWeekGridProps {
  /** Entries already filtered to a single kelas or guru. */
  entries: JadwalEntry[];
  mode: "kelas" | "guru";
  conflictIds: Set<string>;
}

interface DaySpan {
  start: number;
  end: number;
}

export function JadwalWeekGrid({
  entries,
  mode,
  conflictIds,
}: JadwalWeekGridProps) {
  const boundaries = buildTimeBoundaries(entries);
  if (boundaries.length < 2) {
    return (
      <div className="text-ink-muted px-5 py-12 text-center text-sm">
        Belum ada jadwal untuk pilihan ini.
      </div>
    );
  }

  const spans = new Map<string, DaySpan>();
  for (const entry of entries) {
    const start = parseTimeToMinutes(entry.startTime);
    const end = parseTimeToMinutes(entry.endTime);
    const span = spans.get(entry.dayOfWeek);
    spans.set(entry.dayOfWeek, {
      start: Math.min(span?.start ?? start, start),
      end: Math.max(span?.end ?? end, end),
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-175 border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-ink-muted w-28 px-3 py-2 text-left text-xs font-medium">
              Jam
            </th>
            {DAY_OF_WEEK_VALUES.map((dayOfWeek) => (
              <th
                key={dayOfWeek}
                className="text-ink border-hairline border-l px-3 py-2 text-left text-xs font-semibold"
              >
                {DAY_OF_WEEK_LABELS[dayOfWeek]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {boundaries.slice(0, -1).map((slotStart, index) => {
            const slotEnd = boundaries[index + 1];
            const startMin = parseTimeToMinutes(slotStart);
            return (
              <tr key={slotStart} className="border-hairline border-t">
                <td className="text-ink-secondary px-3 py-2 text-xs font-medium tabular-nums">
                  {slotStart}–{slotEnd}
                </td>
                {DAY_OF_WEEK_VALUES.map((dayOfWeek) => {
                  const covering = entries.filter(
                    (entry) =>
                      entry.dayOfWeek === dayOfWeek &&
                      parseTimeToMinutes(entry.startTime) <= startMin &&
                      parseTimeToMinutes(entry.endTime) > startMin,
                  );
                  const span = spans.get(dayOfWeek);
                  const insideSpan =
                    span !== undefined &&
                    startMin >= span.start &&
                    startMin < span.end;

                  if (covering.length === 0) {
                    return (
                      <td
                        key={dayOfWeek}
                        className={`border-hairline border-l px-3 py-2 text-xs ${
                          insideSpan
                            ? mode === "kelas"
                              ? GAP_HIGHLIGHT_CLASS
                              : FREE_SLOT_CLASS
                            : "text-ink-muted"
                        }`}
                      >
                        {insideSpan
                          ? mode === "kelas"
                            ? "Kosong"
                            : "Bebas"
                          : ""}
                      </td>
                    );
                  }

                  const hasConflict = covering.some((entry) =>
                    conflictIds.has(entry.id),
                  );
                  return (
                    <td
                      key={dayOfWeek}
                      className={`border-l px-3 py-2 align-top ${
                        hasConflict || covering.length > 1
                          ? "border-danger/40 bg-danger/10"
                          : "border-hairline bg-brand-50"
                      }`}
                    >
                      {covering.map((entry) => (
                        <div key={entry.id} className="text-xs leading-snug">
                          {entry.startTime === slotStart ? (
                            <>
                              <p className="text-ink font-semibold">
                                {entry.mataPelajaran}
                              </p>
                              <p className="text-ink-secondary">
                                {mode === "kelas" ? entry.guru : entry.kelas}
                              </p>
                            </>
                          ) : (
                            <p className="text-ink-muted">⋮</p>
                          )}
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
