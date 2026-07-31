"use client";

import { useState } from "react";
import { ENTITY_LABELS } from "@/src/lib/constants";
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
  classOptions: { id: string; name: string }[];
  teacherOptions: { id: string; name: string }[];
}

export function JadwalGridView({
  entries,
  conflictIds,
  classOptions,
  teacherOptions,
}: JadwalGridViewProps) {
  const [mode, setMode] = useState<"class" | "teacher">("class");
  const [entityId, setEntityId] = useState<string>("ALL");

  const entityOptions = mode === "class" ? classOptions : teacherOptions;
  const entityKey = mode === "class" ? "classId" : "teacherId";
  const entityEntries =
    entityId === "ALL"
      ? entries
      : entries.filter((entry) => entry[entityKey] === entityId);

  return (
    <div className="border-border rounded-md border bg-white">
      <div className="border-border flex flex-wrap items-center gap-3 border-b px-5 py-4">
        <div className="border-border flex overflow-hidden rounded-sm border text-sm font-medium">
          {(["class", "teacher"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setEntityId("ALL");
              }}
              className={`px-4 py-1.5 transition-colors ${
                mode === value
                  ? "bg-primary-900 text-white"
                  : "text-neutral-600 hover:text-foreground"
              }`}
            >
              Per{" "}
              {value === "class" ? ENTITY_LABELS.CLASS : ENTITY_LABELS.TEACHER}
            </button>
          ))}
        </div>
        <Select value={entityId} onValueChange={setEntityId}>
          <SelectTrigger className="rounded-sm h-10 w-56 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              Ringkasan Semua{" "}
              {mode === "class" ? ENTITY_LABELS.CLASS : ENTITY_LABELS.TEACHER}
            </SelectItem>
            {entityOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
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
