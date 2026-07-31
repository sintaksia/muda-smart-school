"use client";

import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_VALUES } from "@/src/lib/constants";
import { parseTimeToMinutes } from "@/src/features/attendance/utils/time";
import {
  buildTimeBoundaries,
  type JadwalEntry,
} from "@/src/features/attendance/utils/jadwalGrid";
import { FREE_SLOT_CLASS, GAP_HIGHLIGHT_CLASS } from "./jadwalStyles";

interface JadwalWeekGridProps {
  /** Entries already filtered to a single class or teacher. */
  entries: JadwalEntry[];
  mode: "class" | "teacher";
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
      <div className="text-muted-foreground px-5 py-12 text-center text-sm">
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
            <th className="text-muted-foreground w-28 px-3 py-2 text-left text-xs font-medium">
              Jam
            </th>
            {DAY_OF_WEEK_VALUES.map((dayOfWeek) => (
              <th
                key={dayOfWeek}
                className="text-foreground border-border border-l px-3 py-2 text-left text-xs font-semibold"
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
              <tr key={slotStart} className="border-border border-t">
                <td className="text-neutral-600 px-3 py-2 text-xs font-medium tabular-nums">
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
                        className={`border-border border-l px-3 py-2 text-xs ${
                          insideSpan
                            ? mode === "class"
                              ? GAP_HIGHLIGHT_CLASS
                              : FREE_SLOT_CLASS
                            : "text-muted-foreground"
                        }`}
                      >
                        {insideSpan
                          ? mode === "class"
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
                          ? "border-destructive/40 bg-destructive/10"
                          : "border-border bg-primary-50"
                      }`}
                    >
                      {covering.map((entry) => (
                        <div key={entry.id} className="text-xs leading-snug">
                          {entry.startTime === slotStart ? (
                            <>
                              <p className="text-foreground font-semibold">
                                {entry.subjectName}
                              </p>
                              <p className="text-neutral-600">
                                {mode === "class"
                                  ? entry.teacherName
                                  : entry.className}
                              </p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">⋮</p>
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
