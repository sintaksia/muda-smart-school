"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  PROGRAM_KEAHLIAN_SHORT_LABELS,
  programKeahlianOptions,
  studentStatusOptions,
} from "@/src/lib/constants";
import type { KelasOption } from "./types";

export interface SiswaFilterState {
  kelasId: string;
  programKeahlian: string;
  angkatan: string;
  status: string;
}

interface SiswaFiltersProps {
  filters: SiswaFilterState;
  onChange: (filters: SiswaFilterState) => void;
  kelasOptions: KelasOption[];
  angkatanOptions: number[];
}

export function SiswaFilters({
  filters,
  onChange,
  kelasOptions,
  angkatanOptions,
}: SiswaFiltersProps) {
  const set = (key: keyof SiswaFilterState) => (value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={filters.kelasId} onValueChange={set("kelasId")}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Kelas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kelas</SelectItem>
          <SelectItem value="none">Belum ditempatkan</SelectItem>
          {kelasOptions.map((kelas) => (
            <SelectItem key={kelas.id} value={kelas.id}>
              {kelas.nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.programKeahlian}
        onValueChange={set("programKeahlian")}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Program" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Program</SelectItem>
          {programKeahlianOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {PROGRAM_KEAHLIAN_SHORT_LABELS[option.value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.angkatan} onValueChange={set("angkatan")}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Angkatan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Angkatan</SelectItem>
          {angkatanOptions.map((angkatan) => (
            <SelectItem key={angkatan} value={String(angkatan)}>
              {angkatan}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={set("status")}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          {studentStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
