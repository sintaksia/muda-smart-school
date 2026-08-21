"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/src/components/ui/textarea";
import { SelectField } from "@/src/components/common/SelectField";
import { DateField } from "@/src/components/common/DateField";
import { FormDialog } from "@/src/components/common/FormDialog";
import { FormDialogActions } from "@/src/components/common/FormDialogActions";
import { ADMIN_FIELD_CLASS } from "@/src/components/common/formClasses";
import { apiRequest } from "@/src/lib/apiRequest";
import { leaveTypeOptions } from "@/src/lib/constants";

interface IzinFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IzinForm({ open, onOpenChange }: IzinFormProps) {
  const router = useRouter();
  const [type, setType] = useState<string>("SICK");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest(
        "/api/attendance/leave-requests",
        "POST",
        { type, date, reason },
        "Gagal mengajukan izin",
      );
      toast.success("Pengajuan terkirim ke wali kelas");
      setReason("");
      onOpenChange(false);
      router.refresh();
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
      title="Ajukan Izin / Sakit"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            ariaLabel="Jenis Pengajuan"
            value={type}
            onChange={setType}
            className={ADMIN_FIELD_CLASS}
            options={leaveTypeOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          <DateField
            ariaLabel="Tanggal"
            value={date}
            onChange={setDate}
            className={ADMIN_FIELD_CLASS}
          />
        </div>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Alasan (mis. demam, acara keluarga)…"
          required
          minLength={3}
          rows={3}
          className="bg-white text-sm"
        />
        <FormDialogActions
          onCancel={() => onOpenChange(false)}
          submitting={submitting}
          submitLabel="Kirim Pengajuan"
          disabled={reason.trim().length < 3}
        />
      </form>
    </FormDialog>
  );
}
