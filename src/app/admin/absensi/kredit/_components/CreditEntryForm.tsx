"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/src/components/ui/input";
import { SelectField } from "@/src/components/common/SelectField";
import { FormDialog } from "@/src/components/common/FormDialog";
import { FormDialogActions } from "@/src/components/common/FormDialogActions";
import { ADMIN_FIELD_CLASS } from "@/src/components/common/formClasses";
import { apiRequest } from "@/src/lib/apiRequest";
import {
  creditEntryTypeOptions,
  CREDIT_OWNER_TYPE_LABELS,
} from "@/src/lib/constants";

/** Manual entry records a prestasi or pelanggaran; CORRECTION is only ever
 *  written by the system when an earlier entry is reversed. */
const manualEntryTypeOptions = creditEntryTypeOptions.filter(
  (option) => option.value !== "CORRECTION",
);

interface CreditEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerType: "STUDENT" | "TEACHER";
  ownerId: string;
  ownerName: string;
  categories: { ownerType: string; type: string; name: string }[];
  onSaved: () => void;
}

export function CreditEntryForm({
  open,
  onOpenChange,
  ownerType,
  ownerId,
  ownerName,
  categories,
  onSaved,
}: CreditEntryFormProps) {
  const [type, setType] = useState<"ACHIEVEMENT" | "VIOLATION">("VIOLATION");
  const [category, setCategory] = useState<string>("");
  const [points, setPoints] = useState<string>("-5");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const categoryOptions = categories.filter(
    (item) => item.ownerType === ownerType && item.type === type,
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest(
        "/api/attendance/credit-scores",
        "POST",
        {
          ownerType,
          ownerId,
          type,
          category,
          points: Number(points),
          note: note || undefined,
        },
        "Gagal menyimpan entri",
      );
      toast.success("Entri kredit tersimpan");
      setNote("");
      setCategory("");
      onOpenChange(false);
      onSaved();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Entri Manual"
      description={`${CREDIT_OWNER_TYPE_LABELS[ownerType]}: ${ownerName}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            ariaLabel="Jenis Entri"
            value={type}
            onChange={(next) => {
              setType(next as "ACHIEVEMENT" | "VIOLATION");
              setCategory("");
            }}
            className={ADMIN_FIELD_CLASS}
            options={manualEntryTypeOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          <Input
            type="number"
            value={points}
            onChange={(event) => setPoints(event.target.value)}
            className={`${ADMIN_FIELD_CLASS} tabular-nums`}
            placeholder="Poin (mis. -5 / 10)"
            required
          />
        </div>
        <SelectField
          ariaLabel="Kategori"
          placeholder="Pilih kategori…"
          value={category}
          onChange={setCategory}
          className={ADMIN_FIELD_CLASS}
          options={categoryOptions.map((option) => ({
            value: option.name,
            label: option.name,
          }))}
        />
        <Input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className={ADMIN_FIELD_CLASS}
          placeholder="Catatan (opsional)"
        />
        <FormDialogActions
          onCancel={() => onOpenChange(false)}
          submitting={submitting}
          submitLabel="Simpan Entri"
          disabled={!category}
        />
      </form>
    </FormDialog>
  );
}
