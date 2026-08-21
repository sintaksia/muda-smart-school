"use client";

import type { Control, FieldPath } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ComboboxField } from "@/src/components/common/ComboboxField";
import type { ScheduleFormData } from "@/src/app/api/attendance/schedules/ScheduleSchema";

interface JadwalSelectFieldProps {
  control: Control<ScheduleFormData>;
  name: FieldPath<ScheduleFormData>;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  /** Data-driven lists (kelas, mapel, guru) get a search box; "Hari" does not. */
  searchable?: boolean;
}

export function JadwalSelectField({
  control,
  name,
  label,
  options,
  searchable,
}: JadwalSelectFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {searchable ? (
            <FormControl>
              <ComboboxField
                ariaLabel={label}
                placeholder={`Pilih ${label}`}
                options={options}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </FormControl>
          ) : (
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="rounded-sm w-full">
                  <SelectValue placeholder={`Pilih ${label}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
