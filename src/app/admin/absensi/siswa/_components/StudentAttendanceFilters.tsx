"use client";

import { DateField } from "@/src/components/common/DateField";
import { SelectField } from "@/src/components/common/SelectField";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";
import { attendanceStatusOptions, ENTITY_LABELS } from "@/src/lib/constants";
import { useRecapFilter } from "./useRecapFilter";

export interface ClassOption {
  id: string;
  name: string;
}

interface StudentAttendanceFiltersProps {
  date: string;
  classId: string;
  status: string;
  classOptions: ClassOption[];
}

/** Date / class / status filter bar — see `useRecapFilter` for why the state
 *  lives in the URL. */
export function StudentAttendanceFilters({
  date,
  classId,
  status,
  classOptions,
}: StudentAttendanceFiltersProps) {
  const setParam = useRecapFilter();

  return (
    <section className="border-border flex flex-wrap items-end gap-3 rounded-md border bg-white p-4">
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs font-semibold">
          Tanggal
        </span>
        <DateField
          ariaLabel="Filter tanggal"
          value={date}
          onChange={(next) => setParam("date", next)}
          className={FILTER_FIELD_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs font-semibold">
          {ENTITY_LABELS.CLASS}
        </span>
        <SelectField
          searchable
          ariaLabel={`Filter ${ENTITY_LABELS.CLASS}`}
          value={classId}
          onChange={(next) => setParam("classId", next)}
          emptyLabel={`Semua ${ENTITY_LABELS.CLASS}`}
          className={FILTER_FIELD_CLASS}
          options={classOptions.map((option) => ({
            value: option.id,
            label: option.name,
          }))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs font-semibold">
          Status
        </span>
        <SelectField
          ariaLabel="Filter status kehadiran"
          value={status}
          onChange={(next) => setParam("status", next)}
          emptyLabel="Semua Status"
          className={FILTER_FIELD_CLASS}
          options={attendanceStatusOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
      </div>
    </section>
  );
}
