"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface DeleteRowButtonProps {
  onClick: () => void;
  /** Describes the row being removed, e.g. "Hapus kelas". */
  label: string;
  disabled?: boolean;
}

/**
 * Icon-only delete affordance for a master-data table row. Master-data tables
 * delete in place rather than through the CMS `CmsRowActions` dropdown, so this
 * is the one place that markup lives.
 */
export function DeleteRowButton({
  onClick,
  label,
  disabled,
}: DeleteRowButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-5 w-5" strokeWidth={1.75} />
    </Button>
  );
}
