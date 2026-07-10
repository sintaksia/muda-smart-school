"use client";

import { HARI_LABELS, HARI_VALUES } from "@/src/lib/constants";
import {
  summarizeByEntity,
  type JadwalEntry,
} from "@/src/features/attendance/utils/jadwalGrid";
import { GAP_HIGHLIGHT_CLASS } from "./jadwalStyles";

interface JadwalHeatmapProps {
  entries: JadwalEntry[];
  mode: "kelas" | "guru";
  entityOptions: { id: string; nama: string }[];
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
  const entityKey = mode === "kelas" ? "kelasId" : "guruId";
  const summary = summarizeByEntity(entries, entityKey);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-175 border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-ink-muted w-40 px-3 py-2 text-left text-xs font-medium">
              {mode === "kelas" ? "Kelas" : "Guru"}
            </th>
            {HARI_VALUES.map((hari) => (
              <th
                key={hari}
                className="text-ink border-hairline border-l px-3 py-2 text-left text-xs font-semibold"
              >
                {HARI_LABELS[hari]}
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
                    {entity.nama}
                  </button>
                </td>
                {HARI_VALUES.map((hari) => {
                  const day = days?.get(hari);
                  if (!day) {
                    return (
                      <td
                        key={hari}
                        className="border-hairline text-ink-muted border-l px-3 py-2 text-xs"
                      />
                    );
                  }
                  return (
                    <td
                      key={hari}
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
                      {mode === "kelas" && day.gapCount > 0 && (
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
        Klik nama {mode === "kelas" ? "kelas" : "guru"} untuk melihat detail
        grid mingguan. Merah = jadwal bentrok, kuning = ada jam kosong di antara
        sesi.
      </p>
    </div>
  );
}
