"use client";

import { useState } from "react";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { SelectField } from "@/src/components/common/SelectField";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";
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
  // `""` is the "all entities" view — the value `SelectField` emits for its
  // empty row, and what the heatmap falls back to.
  const [entityId, setEntityId] = useState<string>("");

  const entityOptions = mode === "class" ? classOptions : teacherOptions;
  const entityKey = mode === "class" ? "classId" : "teacherId";
  const entityLabel =
    mode === "class" ? ENTITY_LABELS.CLASS : ENTITY_LABELS.TEACHER;
  const entityEntries = entityId
    ? entries.filter((entry) => entry[entityKey] === entityId)
    : entries;

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
                setEntityId("");
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
        <SelectField
          searchable
          ariaLabel={`Filter ${entityLabel}`}
          className={FILTER_FIELD_CLASS}
          value={entityId}
          onChange={setEntityId}
          emptyLabel={`Ringkasan Semua ${entityLabel}`}
          options={entityOptions.map((option) => ({
            value: option.id,
            label: option.name,
          }))}
        />
      </div>

      {!entityId ? (
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
