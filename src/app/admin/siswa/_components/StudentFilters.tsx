"use client";

import { SelectField } from "@/src/components/common/SelectField";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";
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
      <SelectField
        searchable
        ariaLabel={ENTITY_LABELS.CLASS}
        className={FILTER_FIELD_CLASS}
        value={value.classId}
        onChange={(next) => set("classId", next)}
        emptyLabel={`Semua ${ENTITY_LABELS.CLASS}`}
        options={[
          { value: "UNASSIGNED", label: "Belum ditempatkan" },
          ...classOptions.map((schoolClass) => ({
            value: schoolClass.id,
            label: schoolClass.name,
          })),
        ]}
      />

      <SelectField
        ariaLabel="Program Keahlian"
        className={FILTER_FIELD_CLASS}
        value={value.specialization}
        onChange={(next) => set("specialization", next)}
        emptyLabel="Semua Program"
        options={specializationOptions.map((option) => ({
          value: option.value,
          label: option.short,
        }))}
      />

      <SelectField
        ariaLabel="Status"
        className={FILTER_FIELD_CLASS}
        value={value.status}
        onChange={(next) => set("status", next)}
        emptyLabel="Semua Status"
        options={studentStatusOptions.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
      />
    </div>
  );
}
