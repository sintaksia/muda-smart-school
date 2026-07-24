"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import type { JadwalEntry } from "@/src/features/attendance/utils/jadwalGrid";
import { JadwalWeekGrid } from "./JadwalWeekGrid";
import { JadwalHeatmap } from "./JadwalHeatmap";

interface JadwalGridViewProps {
  entries: JadwalEntry[];
  conflictIds: Set<string>;
  kelasOptions: { id: string; nama: string }[];
  guruOptions: { id: string; nama: string }[];
}

export function JadwalGridView({
  entries,
  conflictIds,
  kelasOptions,
  guruOptions,
}: JadwalGridViewProps) {
  const [mode, setMode] = useState<"kelas" | "guru">("kelas");
  const [entityId, setEntityId] = useState<string>("ALL");

  const entityOptions = mode === "kelas" ? kelasOptions : guruOptions;
  const entityKey = mode === "kelas" ? "classId" : "teacherId";
  const entityEntries =
    entityId === "ALL"
      ? entries
      : entries.filter((entry) => entry[entityKey] === entityId);

  return (
    <div className="border-hairline rounded-card border bg-white">
      <div className="border-hairline flex flex-wrap items-center gap-3 border-b px-5 py-4">
        <div className="border-hairline flex overflow-hidden rounded-full border text-sm font-medium">
          {(["kelas", "guru"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setEntityId("ALL");
              }}
              className={`px-4 py-1.5 transition-colors ${
                mode === value
                  ? "bg-brand text-white"
                  : "text-ink-secondary hover:text-ink"
              }`}
            >
              Per {value === "kelas" ? "Kelas" : "Guru"}
            </button>
          ))}
        </div>
        <Select value={entityId} onValueChange={setEntityId}>
          <SelectTrigger className="rounded-input h-10 w-56 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              Ringkasan Semua {mode === "kelas" ? "Kelas" : "Guru"}
            </SelectItem>
            {entityOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {entityId === "ALL" ? (
        <JadwalHeatmap
          entries={entries}
          mode={mode}
          entityOptions={entityOptions}
          onSelectEntity={setEntityId}
        />
      ) : (
        <JadwalWeekGrid
          entries={entityEntries}
          mode={mode}
          conflictIds={conflictIds}
        />
      )}
    </div>
  );
}
