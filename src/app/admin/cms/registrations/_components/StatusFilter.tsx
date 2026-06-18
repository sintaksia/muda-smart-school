"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Badge } from "@/src/app/admin/_components/Badge";
import { statusPendaftaranOptions } from "@/src/lib/constants";

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  const statusOptions = [
    { value: "all", label: "Semua Status", badge: null },
    ...statusPendaftaranOptions,
  ];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Filter Status">
          {value === "all" ? (
            "Semua Status"
          ) : (
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  statusOptions.find((opt) => opt.value === value)?.badge ||
                  "default"
                }
                className="text-xs"
              >
                {statusOptions.find((opt) => opt.value === value)?.label}
              </Badge>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {option.badge ? (
                <Badge variant={option.badge} className="text-xs">
                  {option.label}
                </Badge>
              ) : (
                <span>{option.label}</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
