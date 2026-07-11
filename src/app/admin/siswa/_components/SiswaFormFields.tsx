"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Input } from "@/src/components/ui/input";
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
import {
  programKeahlianOptions,
  studentStatusOptions,
} from "@/src/lib/constants";
import type { KelasOption } from "./types";

interface FieldsProps<T extends FieldValues> {
  control: Control<T>;
}

interface TextFieldProps<T extends FieldValues> extends FieldsProps<T> {
  name: FieldPath<T>;
  label: string;
  type?: string;
  placeholder?: string;
}

export function SiswaTextField<T extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  placeholder,
}: TextFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(
                  type === "number" ? Number(e.target.value) : e.target.value,
                )
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface SelectFieldProps<T extends FieldValues> extends FieldsProps<T> {
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
}

export function SiswaSelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
}: SelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={typeof field.value === "string" ? field.value : ""}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
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

export function SiswaAcademicFields<T extends FieldValues>({
  control,
  kelasOptions,
}: FieldsProps<T> & { kelasOptions: KelasOption[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SiswaTextField
        control={control}
        name={"nis" as FieldPath<T>}
        label="NIS"
      />
      <SiswaTextField
        control={control}
        name={"nisn" as FieldPath<T>}
        label="NISN"
        placeholder="10 digit angka"
      />
      <SiswaSelectField
        control={control}
        name={"programKeahlian" as FieldPath<T>}
        label="Program Keahlian"
        placeholder="Pilih program"
        options={programKeahlianOptions.map((o) => ({
          value: o.value,
          label: o.label,
        }))}
      />
      <SiswaTextField
        control={control}
        name={"angkatan" as FieldPath<T>}
        label="Angkatan"
        type="number"
      />
      <SiswaSelectField
        control={control}
        name={"kelasId" as FieldPath<T>}
        label="Kelas"
        placeholder="Belum ditempatkan"
        options={kelasOptions.map((kelas) => ({
          value: kelas.id,
          label: `${kelas.nama} — ${kelas.tahunAjaran}`,
        }))}
      />
      <SiswaSelectField
        control={control}
        name={"status" as FieldPath<T>}
        label="Status"
        placeholder="Pilih status"
        options={studentStatusOptions.map((o) => ({
          value: o.value,
          label: o.label,
        }))}
      />
    </div>
  );
}
