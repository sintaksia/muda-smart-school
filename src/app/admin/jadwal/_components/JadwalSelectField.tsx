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
import type { ScheduleFormData } from "@/src/app/api/attendance/schedules/ScheduleSchema";

interface JadwalSelectFieldProps {
  control: Control<ScheduleFormData>;
  name: FieldPath<ScheduleFormData>;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

export function JadwalSelectField({
  control,
  name,
  label,
  options,
}: JadwalSelectFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="rounded-input w-full">
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
