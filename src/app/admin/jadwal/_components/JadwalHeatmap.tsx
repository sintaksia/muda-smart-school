"use client";

import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_VALUES } from "@/src/lib/constants";
import {
  summarizeByEntity,
  type JadwalEntry,
} from "@/src/features/attendance/utils/jadwalGrid";
import { GAP_HIGHLIGHT_CLASS } from "./jadwalStyles";

interface JadwalHeatmapProps {
  entries: JadwalEntry[];
  mode: "class" | "teacher";
  entityOptions: { id: string; name: string }[];
  onSelectEntity: (id: string) => void;
}

function cellShade(hours: number): string {
  if (hours === 0) return "bg-white";
  if (hours < 2) return "bg-brand-50";
  if (hours < 4) return "bg-brand-100";
  if (hours < 6) return "bg-brand-100 text-brand-700";
  return "bg-brand-600/20 text-brand-700";
}

export function JadwalHeatmap({
  entries,
  mode,
  entityOptions,
  onSelectEntity,
}: JadwalHeatmapProps) {
  const entityKey = mode === "class" ? "classId" : "teacherId";
  const summary = summarizeByEntity(entries, entityKey);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-175 border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-ink-muted w-40 px-3 py-2 text-left text-xs font-medium">
              {mode === "class" ? "Kelas" : "Guru"}
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
          {entityOptions.map((entity) => {
            const days = summary.get(entity.id);
            return (
              <tr key={entity.id} className="border-hairline border-t">
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onSelectEntity(entity.id)}
                    className="text-ink hover:text-brand text-left text-xs font-semibold transition-colors"
                  >
                    {entity.name}
                  </button>
                </td>
                {DAY_OF_WEEK_VALUES.map((dayOfWeek) => {
                  const day = days?.get(dayOfWeek);
                  if (!day) {
                    return (
                      <td
                        key={dayOfWeek}
                        className="border-hairline text-ink-muted border-l px-3 py-2 text-xs"
                      />
                    );
                  }
                  return (
                    <td
                      key={dayOfWeek}
                      className={`border-l px-3 py-2 text-xs tabular-nums ${
                        day.hasConflict
                          ? "border-danger/40 bg-danger/10 text-danger font-semibold"
                          : `border-hairline ${cellShade(day.totalHours)}`
                      }`}
                    >
                      <span className="font-semibold">
                        {day.totalHours % 1 === 0
                          ? day.totalHours
                          : day.totalHours.toFixed(1)}
                        j
                      </span>{" "}
                      · {day.sessionCount} sesi
                      {day.hasConflict && <span> · Bentrok</span>}
                      {mode === "class" && day.gapCount > 0 && (
                        <span
                          className={`mt-1 block rounded px-1.5 py-0.5 font-semibold ${GAP_HIGHLIGHT_CLASS}`}
                        >
                          {day.gapCount} jam kosong
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-ink-muted border-hairline border-t px-3 py-2 text-xs">
        Klik nama {mode === "class" ? "kelas" : "guru"} untuk melihat detail
        grid mingguan. Merah = jadwal bentrok, kuning = ada jam kosong di antara
        sesi.
      </p>
    </div>
  );
}
