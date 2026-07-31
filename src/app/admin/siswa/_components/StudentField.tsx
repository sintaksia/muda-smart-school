"use client";

import type { ReactNode } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { CreateStudentFormData } from "@/src/app/api/master/students/StudentSchema";

interface StudentFieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Props every field group of the student form receives. */
export interface StudentFieldGroupProps {
  register: UseFormRegister<CreateStudentFormData>;
  errors: FieldErrors<CreateStudentFormData>;
}

export const studentInputClass =
  "border-neutral-300 text-foreground rounded-sm h-11 w-full border bg-white px-3 text-sm";

/** Registers an optional control so an empty value is stored as null. */
export const nullableField = { setValueAs: (value: string) => value || null };

/** Label + control + validation message, shared by every student form field. */
export function StudentField({
  label,
  error,
  hint,
  children,
}: StudentFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-neutral-600 text-xs font-semibold">{label}</span>
      {children}
      {hint && !error && (
        <span className="text-muted-foreground text-xs">{hint}</span>
      )}
      {error && <span className="text-destructive text-xs">{error}</span>}
    </label>
  );
}
