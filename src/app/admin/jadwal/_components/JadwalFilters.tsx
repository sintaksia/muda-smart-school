"use client";

import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { dayOfWeekOptions } from "@/src/lib/constants";

export interface JadwalFilterState {
  dayOfWeek: string;
  classId: string;
  teacherId: string;
}

export const EMPTY_FILTERS: JadwalFilterState = {
  dayOfWeek: "ALL",
  classId: "ALL",
  teacherId: "ALL",
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
  const hasActiveFilter =
    filters.dayOfWeek !== "ALL" ||
    filters.classId !== "ALL" ||
    filters.teacherId !== "ALL";

  const selects = [
    {
      key: "dayOfWeek" as const,
      placeholder: "Semua Hari",
      options: dayOfWeekOptions.map((option) => ({
        value: option.value as string,
        label: option.label,
      })),
    },
    {
      key: "classId" as const,
      placeholder: "Semua Kelas",
      options: classOptions.map((option) => ({
        value: option.id,
        label: option.name,
      })),
    },
    {
      key: "teacherId" as const,
      placeholder: "Semua Guru",
      options: teacherOptions.map((option) => ({
        value: option.id,
        label: option.name,
      })),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {selects.map((select) => (
        <Select
          key={select.key}
          value={filters[select.key]}
          onValueChange={(value) =>
            onChange({ ...filters, [select.key]: value })
          }
        >
          <SelectTrigger className="rounded-input h-10 w-44 bg-white">
            <SelectValue placeholder={select.placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{select.placeholder}</SelectItem>
            {select.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {hasActiveFilter && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="text-ink-muted hover:text-ink h-10 px-3 text-sm"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
          Reset
        </Button>
      )}
    </div>
  );
}
