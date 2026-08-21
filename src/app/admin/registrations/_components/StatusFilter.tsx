"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Badge } from "@/src/app/admin/_components/Badge";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";
import {
  EMPTY_SELECT_VALUE,
  fromSelectValue,
  toSelectValue,
} from "@/src/components/common/selectSentinel";
import { registrationStatusOptions } from "@/src/lib/constants";

const ALL_LABEL = "Semua Status";

interface StatusFilterProps {
  /** `""` means no filter — same contract as `SelectField`. */
  value: string;
  onChange: (value: string) => void;
}

/**
 * `SelectField` with the status pill rendered inside the trigger — the one
 * filter that shows its value as a badge rather than plain text, which is why
 * it drives the Radix primitive directly instead of going through the
 * primitive wrapper.
 */
export function StatusFilter({ value, onChange }: StatusFilterProps) {
  const selected = registrationStatusOptions.find(
    (option) => option.value === value,
  );

  return (
    <Select
      value={toSelectValue(value)}
      onValueChange={(next) => onChange(fromSelectValue(next, ""))}
    >
      <SelectTrigger aria-label="Filter Status" className={FILTER_FIELD_CLASS}>
        <SelectValue placeholder={ALL_LABEL}>
          {selected ? (
            <Badge variant={selected.badge}>{selected.label}</Badge>
          ) : (
            ALL_LABEL
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={EMPTY_SELECT_VALUE}>{ALL_LABEL}</SelectItem>
        {registrationStatusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <Badge variant={option.badge}>{option.label}</Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
