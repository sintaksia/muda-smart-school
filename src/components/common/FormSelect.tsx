"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import {
  EMPTY_SELECT_VALUE,
  fromSelectValue,
  toSelectValue,
} from "./selectSentinel";
import { ComboboxField } from "./ComboboxField";
import type { SelectOption } from "./selectOption";

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  options: readonly SelectOption[];
  placeholder?: string;
  /** Renders an opt-out choice that stores `null`, e.g. "— Tidak diisi —". */
  emptyLabel?: string;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  /** Swaps the plain list for a searchable popover — see `SelectField`. */
  searchable?: boolean;
  /** Searchable only: placeholder for the search box. */
  searchPlaceholder?: string;
}

/**
 * The standard dropdown for a react-hook-form field that is registered with
 * `control` rather than `register` — Radix Select is not a native form control,
 * so it has to go through `Controller`. Forms built on shadcn `<Form>` should
 * use `FormField` + `Select` directly instead. — docs/design_system.md §6.1
 */
export function FormSelect<T extends FieldValues>({
  control,
  name,
  options,
  placeholder,
  emptyLabel,
  ariaLabel,
  className,
  disabled,
  searchable,
  searchPlaceholder,
}: FormSelectProps<T>) {
  const empty = emptyLabel ? null : "";
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) =>
        searchable ? (
          <ComboboxField
            value={field.value ?? ""}
            onChange={(next) => field.onChange(next === "" ? empty : next)}
            options={options}
            emptyLabel={emptyLabel}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            ariaLabel={ariaLabel ?? name}
            className={className}
            disabled={disabled}
            onBlur={field.onBlur}
          />
        ) : (
          <Select
            value={toSelectValue(field.value)}
            onValueChange={(next) =>
              field.onChange(fromSelectValue(next, empty))
            }
            disabled={disabled}
          >
            <SelectTrigger
              aria-label={ariaLabel}
              onBlur={field.onBlur}
              className={cn("w-full bg-white", className)}
            >
              <SelectValue placeholder={placeholder ?? emptyLabel} />
            </SelectTrigger>
            <SelectContent>
              {emptyLabel && (
                <SelectItem value={EMPTY_SELECT_VALUE}>{emptyLabel}</SelectItem>
              )}
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }
    />
  );
}
