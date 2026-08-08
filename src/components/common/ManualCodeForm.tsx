"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ADMIN_FIELD_CLASS } from "@/src/components/common/formClasses";

interface ManualCodeFormProps {
  /** Called with the trimmed value; the field clears once it resolves. */
  onSubmit: (value: string) => Promise<void>;
  placeholder: string;
  submitLabel: string;
  disabled?: boolean;
}

/**
 * Typed fallback for both scanning flows — the student entering the session
 * code from the teacher's screen, and the teacher entering a NIS when a card
 * is missing. Cameras fail; this always works.
 */
export function ManualCodeForm({
  onSubmit,
  placeholder,
  submitLabel,
  disabled,
}: ManualCodeFormProps) {
  const [value, setValue] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setValue("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
      <Input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled || submitting}
        className={`${ADMIN_FIELD_CLASS} flex-1 font-mono text-sm`}
      />
      <Button
        type="submit"
        disabled={disabled || submitting || value.trim().length === 0}
        className="h-11"
      >
        {submitting ? "..." : submitLabel}
      </Button>
    </form>
  );
}
