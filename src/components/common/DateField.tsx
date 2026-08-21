"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { formatTanggal, parseDateValue, toDateValue } from "@/src/lib/date";
import { cn } from "@/src/lib/utils";

/** Earliest year a birth-date picker needs to reach. */
const BIRTH_DATE_START = new Date(1945, 0);
/** How far past the current year an ordinary picker may navigate. */
const FUTURE_YEARS = 5;

export interface DateFieldProps {
  /** `yyyy-MM-dd`, or `""` when empty — same shape a native date input emits. */
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  /** Forwarded to the trigger so react-hook-form can mark the field touched. */
  onBlur?: () => void;
  /** Shown while nothing is picked. Defaults to "Pilih tanggal". */
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /**
   * Widens the range back to 1945 and caps it at today. Use for any date of
   * birth — the default range is centred on the present and cannot reach far
   * enough back.
   */
  birthDate?: boolean;
  /**
   * `"dropdown"` gives month/year selects; `"label"` gives arrows only. The
   * dropdown is the default because arrow-stepping across years is unusable.
   */
  captionLayout?: "label" | "dropdown";
  /** Override the navigable range. Both default from `birthDate`. */
  startMonth?: Date;
  endMonth?: Date;
  /** Adds a "Hapus tanggal" action once a date is picked. */
  clearable?: boolean;
}

/**
 * The standard date picker for a plain controlled value — table filters and
 * `useState`-backed forms alike. Never hand-roll `<Input type="date">`: the
 * native control renders differently in every browser and ignores the design
 * system entirely. For react-hook-form fields use `FormDateField` instead.
 * — docs/design_system.md §6.1
 */
export function DateField({
  value,
  onChange,
  ariaLabel,
  onBlur,
  placeholder = "Pilih tanggal",
  className,
  disabled,
  birthDate,
  captionLayout = "dropdown",
  startMonth,
  endMonth,
  clearable,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDateValue(value);
  const today = new Date();

  // react-day-picker caps a dropdown caption at the end of the current year
  // unless told otherwise, which would hide a leave request booked for
  // January. Both bounds are therefore always explicit.
  const rangeStart =
    startMonth ??
    (birthDate ? BIRTH_DATE_START : new Date(today.getFullYear() - 5, 0));
  const rangeEnd =
    endMonth ??
    (birthDate ? today : new Date(today.getFullYear() + FUTURE_YEARS, 11));

  const commit = (date: Date | undefined) => {
    onChange(date ? toDateValue(date) : "");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={ariaLabel}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-start gap-2 border-input bg-white px-3 font-normal",
            // `outline` resolves to hover:bg-accent, which is off-palette blue
            "hover:bg-primary-50 hover:text-primary-900",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 opacity-60" />
          <span className="truncate">
            {selected ? formatTanggal(selected) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={commit}
          defaultMonth={selected}
          captionLayout={captionLayout}
          startMonth={rangeStart}
          endMonth={rangeEnd}
          autoFocus
        />
        {clearable && selected && (
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full hover:bg-primary-50 hover:text-primary-900"
              onClick={() => commit(undefined)}
            >
              Hapus tanggal
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
