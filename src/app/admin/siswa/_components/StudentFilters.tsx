"use client";

import {
  specializationOptions,
  studentStatusOptions,
  ENTITY_LABELS,
} from "@/src/lib/constants";

export interface StudentFilterState {
  classId: string;
  status: string;
  specialization: string;
}

interface StudentFiltersProps {
  value: StudentFilterState;
  onChange: (value: StudentFilterState) => void;
  classOptions: { id: string; name: string }[];
}

const selectClass =
  "border-neutral-300 text-foreground rounded-sm h-9 border bg-white px-2 text-xs";

export function StudentFilters({
  value,
  onChange,
  classOptions,
}: StudentFiltersProps) {
  function set(field: keyof StudentFilterState, next: string): void {
    onChange({ ...value, [field]: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={ENTITY_LABELS.CLASS}
        value={value.classId}
        onChange={(e) => set("classId", e.target.value)}
        className={selectClass}
      >
        <option value="">Semua {ENTITY_LABELS.CLASS}</option>
        <option value="UNASSIGNED">Belum ditempatkan</option>
        {classOptions.map((schoolClass) => (
          <option key={schoolClass.id} value={schoolClass.id}>
            {schoolClass.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Program Keahlian"
        value={value.specialization}
        onChange={(e) => set("specialization", e.target.value)}
        className={selectClass}
      >
        <option value="">Semua Program</option>
        {specializationOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.short}
          </option>
        ))}
      </select>

      <select
        aria-label="Status"
        value={value.status}
        onChange={(e) => set("status", e.target.value)}
        className={selectClass}
      >
        <option value="">Semua Status</option>
        {studentStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
