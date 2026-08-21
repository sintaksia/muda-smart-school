"use client";

import { Button } from "@/src/components/ui/button";

interface FormDialogActionsProps {
  onCancel: () => void;
  submitting: boolean;
  /** Label on the submit button while idle. */
  submitLabel?: string;
  /** Extra guard on top of `submitting` — e.g. a required select still empty. */
  disabled?: boolean;
}

/** Cancel + submit row shared by every `FormDialog` form. Lives inside the
 *  `<form>` so the submit button keeps `type="submit"`. */
export function FormDialogActions({
  onCancel,
  submitting,
  submitLabel = "Simpan",
  disabled = false,
}: FormDialogActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={submitting}
      >
        Batal
      </Button>
      <Button type="submit" disabled={submitting || disabled}>
        {submitting ? "Menyimpan..." : submitLabel}
      </Button>
    </div>
  );
}
