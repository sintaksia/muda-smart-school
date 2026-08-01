"use client";

import type { ReactNode } from "react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
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
  /** Radix Select is not a native control, so its fields go through Controller. */
  control: Control<CreateStudentFormData>;
  errors: FieldErrors<CreateStudentFormData>;
}

export { ADMIN_FIELD_CLASS as studentInputClass } from "@/src/components/common/formClasses";

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
