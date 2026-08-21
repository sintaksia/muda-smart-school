"use client";

import { SelectField } from "@/src/components/common/SelectField";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";

interface ClassAcademicYearFilterProps {
  value: string;
  onChange: (value: string) => void;
  academicYears: string[];
  totalShown: number;
}

/**
 * Classes are never deleted while they still hold students, so the list grows by
 * a full year's worth of rombel every promotion. This keeps the table on one
 * year at a time.
 */
export function ClassAcademicYearFilter({
  value,
  onChange,
  academicYears,
  totalShown,
}: ClassAcademicYearFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SelectField
        ariaLabel="Tahun Ajaran"
        value={value}
        onChange={onChange}
        className={FILTER_FIELD_CLASS}
        emptyLabel="Semua Tahun Ajaran"
        options={academicYears.map((academicYear) => ({
          value: academicYear,
          label: academicYear,
        }))}
      />
      <span className="text-muted-foreground text-xs tabular-nums">
        {totalShown} kelas
      </span>
    </div>
  );
}
