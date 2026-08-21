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
import {
  ENTITY_LABELS,
  gradeLevelOptions,
  specializationOptions,
} from "@/src/lib/constants";

interface ClassFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherOptions: { id: string; name: string }[];
  /** Prefills the year field with whatever the table is currently showing. */
  defaultAcademicYear: string;
}

export function ClassForm({
  open,
  onOpenChange,
  teacherOptions,
  defaultAcademicYear,
}: ClassFormProps) {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [gradeLevel, setGradeLevel] = useState<string>("10");
  const [specialization, setSpecialization] = useState<string>(
    specializationOptions[0].value,
  );
  const [academicYear, setAcademicYear] = useState<string>(defaultAcademicYear);
  const [homeroomTeacherId, setHomeroomTeacherId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest(
        "/api/master/classes",
        "POST",
        {
          name,
          gradeLevel: Number(gradeLevel),
          specialization,
          academicYear,
          homeroomTeacherId: homeroomTeacherId || null,
        },
        `Gagal membuat ${ENTITY_LABELS.CLASS.toLowerCase()}`,
      );
      toast.success(`${ENTITY_LABELS.CLASS} dibuat`);
      setName("");
      setHomeroomTeacherId("");
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
      title={`Tambah ${ENTITY_LABELS.CLASS}`}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nama (mis. X PPLG 1)"
          required
          minLength={2}
          className={ADMIN_FIELD_CLASS}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            ariaLabel="Tingkat"
            value={gradeLevel}
            onChange={setGradeLevel}
            className={ADMIN_FIELD_CLASS}
            options={gradeLevelOptions.map((option) => ({
              value: String(option.value),
              label: option.label,
            }))}
          />
          <Input
            value={academicYear}
            onChange={(event) => setAcademicYear(event.target.value)}
            placeholder="2026/2027"
            pattern="\d{4}/\d{4}"
            required
            className={`${ADMIN_FIELD_CLASS} tabular-nums`}
          />
        </div>
        <SelectField
          ariaLabel="Program Keahlian"
          value={specialization}
          onChange={setSpecialization}
          className={ADMIN_FIELD_CLASS}
          options={specializationOptions.map((option) => ({
            value: option.value,
            label: option.short,
          }))}
        />
        <SelectField
          searchable
          ariaLabel="Wali Kelas"
          value={homeroomTeacherId}
          onChange={setHomeroomTeacherId}
          className={ADMIN_FIELD_CLASS}
          emptyLabel="Wali kelas (opsional)"
          options={teacherOptions.map((teacher) => ({
            value: teacher.id,
            label: teacher.name,
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
