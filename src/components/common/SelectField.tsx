"use client";

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

export type { SelectOption };

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  /**
   * Label of the choice that means "no value" — a filter's "Semua Kelas" or a
   * form's "— Belum ada —". Selecting it emits `""`. Omit for a required
   * select, which then has no way to return to empty.
   */
  emptyLabel?: string;
  /**
   * Shown while nothing is selected — and only meaningful *without* an
   * `emptyLabel`, since an empty row is itself a selection. Renders muted;
   * `emptyLabel` renders in the foreground. Defaults to `ariaLabel`.
   */
  placeholder?: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  /**
   * Swaps the plain list for a searchable popover. Turn it on for any list
   * whose length is data-driven — students, teachers, classes, subjects — and
   * leave it off for a fixed enum, where a search box is just friction.
   */
  searchable?: boolean;
  /** Searchable only: placeholder for the search box. */
  searchPlaceholder?: string;
}

/**
 * The standard dropdown for a plain controlled value — table filters and
 * `useState`-backed forms alike. Never hand-roll a `<select>`: this keeps one
 * trigger, one popover and one keyboard model across the app.
 * For react-hook-form fields use `FormSelect` instead.
 * — docs/design_system.md §6.1
 */
export function SelectField({
  value,
  onChange,
  options,
  emptyLabel,
  placeholder,
  ariaLabel,
  className,
  disabled,
  searchable,
  searchPlaceholder,
}: SelectFieldProps) {
  if (searchable) {
    return (
      <ComboboxField
        value={value}
        onChange={onChange}
        options={options}
        emptyLabel={emptyLabel}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        ariaLabel={ariaLabel}
        className={className}
        disabled={disabled}
      />
    );
  }

  return (
    <Select
      value={toSelectValue(value)}
      onValueChange={(next) => onChange(fromSelectValue(next, ""))}
      disabled={disabled}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn("w-full bg-white", className)}
      >
        <SelectValue placeholder={placeholder ?? emptyLabel ?? ariaLabel} />
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
  );
}
