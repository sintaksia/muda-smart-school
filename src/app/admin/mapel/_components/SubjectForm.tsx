"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/src/components/ui/input";
import { SelectField } from "@/src/components/common/SelectField";
import { FormDialog } from "@/src/components/common/FormDialog";
import { FormDialogActions } from "@/src/components/common/FormDialogActions";
import { ADMIN_FIELD_CLASS } from "@/src/components/common/formClasses";
import { apiRequest } from "@/src/lib/apiRequest";
import { ENTITY_LABELS, specializationOptions } from "@/src/lib/constants";

interface SubjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubjectForm({ open, onOpenChange }: SubjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest(
        "/api/master/subjects",
        "POST",
        { name, code, specialization: specialization || null },
        `Gagal membuat ${ENTITY_LABELS.SUBJECT.toLowerCase()}`,
      );
      toast.success(`${ENTITY_LABELS.SUBJECT} dibuat`);
      setName("");
      setCode("");
      setSpecialization("");
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
      title={`Tambah ${ENTITY_LABELS.SUBJECT}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nama (mis. Matematika)"
          required
          minLength={2}
          className={ADMIN_FIELD_CLASS}
        />
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Kode (mis. MTK)"
          required
          minLength={2}
          maxLength={12}
          className={`${ADMIN_FIELD_CLASS} font-mono uppercase`}
        />
        <SelectField
          ariaLabel="Program Keahlian"
          value={specialization}
          onChange={setSpecialization}
          className={ADMIN_FIELD_CLASS}
          emptyLabel="Umum (semua program)"
          options={specializationOptions.map((option) => ({
            value: option.value,
            label: option.short,
          }))}
        />
        <FormDialogActions
          onCancel={() => onOpenChange(false)}
          submitting={submitting}
        />
      </form>
    </FormDialog>
  );
}
