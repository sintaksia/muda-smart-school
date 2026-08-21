"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/src/components/ui/input";
import { SelectField } from "@/src/components/common/SelectField";
import { DateField } from "@/src/components/common/DateField";
import { FormDialog } from "@/src/components/common/FormDialog";
import { FormDialogActions } from "@/src/components/common/FormDialogActions";
import { ADMIN_FIELD_CLASS } from "@/src/components/common/formClasses";
import { apiRequest } from "@/src/lib/apiRequest";
import { absenceStatusOptions, ENTITY_LABELS } from "@/src/lib/constants";

interface TeacherAbsenceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherOptions: { id: string; name: string }[];
}

export function TeacherAbsenceForm({
  open,
  onOpenChange,
  teacherOptions,
}: TeacherAbsenceFormProps) {
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [status, setStatus] = useState<string>("EXCUSED");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (!teacherId) {
      toast.error(
        `Pilih ${ENTITY_LABELS.TEACHER.toLowerCase()} terlebih dahulu`,
      );
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest(
        "/api/attendance/teacher-absence",
        "POST",
        { teacherId, date, status, note },
        `Gagal mencatat absensi ${ENTITY_LABELS.TEACHER.toLowerCase()}`,
      );
      toast.success(
        `Absensi ${ENTITY_LABELS.TEACHER.toLowerCase()} tercatat untuk semua jadwal hari itu`,
      );
      setTeacherId("");
      setNote("");
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
      title={`Catat Ketidakhadiran ${ENTITY_LABELS.TEACHER}`}
      description="Semua jadwal guru pada tanggal tersebut akan ditandai sekaligus."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <SelectField
          searchable
          ariaLabel={ENTITY_LABELS.TEACHER}
          value={teacherId}
          onChange={setTeacherId}
          className={ADMIN_FIELD_CLASS}
          emptyLabel={`Pilih ${ENTITY_LABELS.TEACHER}…`}
          options={teacherOptions.map((teacher) => ({
            value: teacher.id,
            label: teacher.name,
          }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <DateField
            ariaLabel="Tanggal"
            value={date}
            onChange={setDate}
            className={ADMIN_FIELD_CLASS}
          />
          <SelectField
            ariaLabel="Status"
            value={status}
            onChange={setStatus}
            className={ADMIN_FIELD_CLASS}
            options={absenceStatusOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </div>
        <Input
          type="text"
          placeholder="Catatan (opsional)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className={ADMIN_FIELD_CLASS}
        />
        <FormDialogActions
          onCancel={() => onOpenChange(false)}
          submitting={submitting}
          disabled={!teacherId}
        />
      </form>
    </FormDialog>
  );
}
