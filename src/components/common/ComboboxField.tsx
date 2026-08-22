"use client";

import { useMemo, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import { selectTriggerClass } from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import { EMPTY_SELECT_VALUE } from "./selectSentinel";
import type { SelectOption } from "./selectOption";

/** Long lists render lazily: past this many matches the user should type more
 *  rather than scroll a thousand rows of DOM. */
const MAX_VISIBLE = 100;

export interface ComboboxFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  /** Label of the choice that means "no value". Selecting it emits `""`. */
  emptyLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  /** Passed through so react-hook-form can mark the field touched. */
  onBlur?: () => void;
}

/**
 * The dropdown for lists that outgrow scrolling — students, teachers, classes.
 * Same trigger and same value contract as `SelectField`; the popover holds a
 * search box instead of a bare list. Reach it through `SelectField
 * searchable` / `FormSelect searchable` rather than importing it directly.
 * — docs/design_system.md §6.1
 */
export function ComboboxField({
  value,
  onChange,
  options,
  emptyLabel,
  placeholder,
  searchPlaceholder,
  ariaLabel,
  className,
  disabled,
  onBlur,
}: ComboboxFieldProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");

  const selected = options.find((option) => option.value === value);

  // Mirror what the Radix Select shows so the two triggers are indistinguishable.
  // `emptyLabel` is a *chosen* row there ("Semua Kelas" is a real filter state,
  // and `selectSentinel` gives it a value Radix will accept), so it renders in
  // the foreground; only a true placeholder — nothing selected and no empty row
  // to fall back on — is muted. Getting this wrong is invisible in a form, but
  // side by side in a filter bar one dropdown reads grey and its neighbour black.
  const label = selected?.label ?? emptyLabel ?? placeholder ?? ariaLabel;
  const isPlaceholder = !selected && !emptyLabel;

  // Filtered here rather than by cmdk: matching the label only keeps an id
  // like `cmf3k…` from scoring against the query, and lets the list be capped.
  const matches = useMemo<SelectOption[]>(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options.slice(0, MAX_VISIBLE);
    return options
      .filter((option) => option.label.toLowerCase().includes(needle))
      .slice(0, MAX_VISIBLE);
  }, [options, query]);

  function select(next: string): void {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* eslint-disable jsx-a11y/role-has-required-aria-props -- PopoverTrigger
            injects aria-controls onto this child at runtime; the rule only sees
            the static JSX and cannot know that. */}
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            selectTriggerClass,
            "w-full justify-between bg-white font-normal",
            isPlaceholder && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </button>
        {/* eslint-enable jsx-a11y/role-has-required-aria-props */}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-48 p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={
              searchPlaceholder ?? `Cari ${ariaLabel.toLowerCase()}…`
            }
          />
          <CommandList>
            <CommandEmpty>Tidak ada hasil.</CommandEmpty>
            <CommandGroup>
              {emptyLabel && !query.trim() && (
                <CommandItem
                  value={EMPTY_SELECT_VALUE}
                  onSelect={() => select("")}
                >
                  <CheckIcon
                    className={cn(
                      "size-4",
                      value ? "opacity-0" : "opacity-100",
                    )}
                  />
                  <span>{emptyLabel}</span>
                </CommandItem>
              )}
              {matches.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => select(option.value)}
                >
                  <CheckIcon
                    className={cn(
                      "size-4",
                      option.value === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {options.length > matches.length && (
              <p className="text-muted-foreground border-border border-t px-3 py-2 text-xs">
                Menampilkan {matches.length} dari {options.length}. Ketik untuk
                mempersempit.
              </p>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
