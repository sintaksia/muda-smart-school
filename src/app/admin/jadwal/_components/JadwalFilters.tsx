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
import { hariOptions } from "@/src/lib/constants";

export interface JadwalFilterState {
  hari: string;
  kelasId: string;
  guruId: string;
}

export const EMPTY_FILTERS: JadwalFilterState = {
  hari: "ALL",
  kelasId: "ALL",
  guruId: "ALL",
};

interface JadwalFiltersProps {
  filters: JadwalFilterState;
  onChange: (filters: JadwalFilterState) => void;
  kelasOptions: { id: string; nama: string }[];
  guruOptions: { id: string; nama: string }[];
}

export function JadwalFilters({
  filters,
  onChange,
  kelasOptions,
  guruOptions,
}: JadwalFiltersProps) {
  const hasActiveFilter =
    filters.hari !== "ALL" ||
    filters.kelasId !== "ALL" ||
    filters.guruId !== "ALL";

  const selects = [
    {
      key: "hari" as const,
      placeholder: "Semua Hari",
      options: hariOptions.map((option) => ({
        value: option.value as string,
        label: option.label,
      })),
    },
    {
      key: "kelasId" as const,
      placeholder: "Semua Kelas",
      options: kelasOptions.map((option) => ({
        value: option.id,
        label: option.nama,
      })),
    },
    {
      key: "guruId" as const,
      placeholder: "Semua Guru",
      options: guruOptions.map((option) => ({
        value: option.id,
        label: option.nama,
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
