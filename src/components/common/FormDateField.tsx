"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { DateField, type DateFieldProps } from "./DateField";

interface FormDateFieldProps<T extends FieldValues> extends Omit<
  DateFieldProps,
  "value" | "onChange" | "ariaLabel"
> {
  control: Control<T>;
  name: FieldPath<T>;
  ariaLabel?: string;
  /**
   * Store a cleared date as `null` rather than `""`. Needed by schemas that
   * validate against a `yyyy-MM-dd` regex, which an empty string fails — there
   * "no date" has to be null, not blank.
   */
  nullable?: boolean;
}

/**
 * The standard date picker for a react-hook-form field registered with
 * `control` rather than `register` — the trigger is a button, not a native
 * input, so it has to go through `Controller`. Mirrors `FormSelect`.
 * — docs/design_system.md §6.1
 */
export function FormDateField<T extends FieldValues>({
  control,
  name,
  ariaLabel,
  nullable,
  ...rest
}: FormDateFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <DateField
          {...rest}
          value={field.value ?? ""}
          onChange={(next) => field.onChange(nullable ? next || null : next)}
          ariaLabel={ariaLabel ?? name}
          onBlur={field.onBlur}
        />
      )}
    />
  );
}
