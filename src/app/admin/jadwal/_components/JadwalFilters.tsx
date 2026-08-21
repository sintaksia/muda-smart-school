"use client";

import { X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { SelectField } from "@/src/components/common/SelectField";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";
import { dayOfWeekOptions, ENTITY_LABELS } from "@/src/lib/constants";

export interface JadwalFilterState {
  dayOfWeek: string;
  classId: string;
  teacherId: string;
}

/** An unset filter is `""` — the value `SelectField` emits for its empty row. */
export const EMPTY_FILTERS: JadwalFilterState = {
  dayOfWeek: "",
  classId: "",
  teacherId: "",
};

interface JadwalFiltersProps {
  filters: JadwalFilterState;
  onChange: (filters: JadwalFilterState) => void;
  classOptions: { id: string; name: string }[];
  teacherOptions: { id: string; name: string }[];
}

export function JadwalFilters({
  filters,
  onChange,
  classOptions,
  teacherOptions,
}: JadwalFiltersProps) {
  const hasActiveFilter = Object.values(filters).some(Boolean);

  const selects = [
    {
      key: "dayOfWeek" as const,
      label: "Hari",
      emptyLabel: "Semua Hari",
      options: dayOfWeekOptions.map((option) => ({
        value: option.value as string,
        label: option.label,
      })),
    },
    {
      key: "classId" as const,
      label: ENTITY_LABELS.CLASS,
      emptyLabel: `Semua ${ENTITY_LABELS.CLASS}`,
      // Data-driven list — long enough to want a search box.
      searchable: true,
      options: classOptions.map((option) => ({
        value: option.id,
        label: option.name,
      })),
    },
    {
      key: "teacherId" as const,
      label: ENTITY_LABELS.TEACHER,
      emptyLabel: `Semua ${ENTITY_LABELS.TEACHER}`,
      searchable: true,
      options: teacherOptions.map((option) => ({
        value: option.id,
        label: option.name,
      })),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {selects.map((select) => (
        <SelectField
          key={select.key}
          ariaLabel={`Filter ${select.label}`}
          searchable={select.searchable}
          className={FILTER_FIELD_CLASS}
          value={filters[select.key]}
          onChange={(value) => onChange({ ...filters, [select.key]: value })}
          emptyLabel={select.emptyLabel}
          options={select.options}
        />
      ))}
      {hasActiveFilter && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="text-muted-foreground hover:text-foreground hover:bg-primary-50 h-9 px-3 text-sm"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
          Reset
        </Button>
      )}
    </div>
  );
}
