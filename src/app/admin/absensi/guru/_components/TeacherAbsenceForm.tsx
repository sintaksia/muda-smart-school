"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { SelectField } from "@/src/components/common/SelectField";
import { DateField } from "@/src/components/common/DateField";
import { ADMIN_FIELD_CLASS } from "@/src/components/common/formClasses";
import { absenceStatusOptions, ENTITY_LABELS } from "@/src/lib/constants";

interface TeacherAbsenceFormProps {
  teacherOptions: { id: string; name: string }[];
}

export function TeacherAbsenceForm({
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
      toast.error("Pilih guru terlebih dahulu");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/attendance/teacher-absence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, date, status, note }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal mencatat absensi guru");
      }
      toast.success("Absensi guru tercatat untuk semua jadwal hari itu");
      setNote("");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border rounded-md border bg-white p-5"
    >
      <h3 className="text-foreground mb-4 text-base font-semibold">
        Catat Ketidakhadiran {ENTITY_LABELS.TEACHER}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SelectField
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
        <Input
          type="text"
          placeholder="Catatan (opsional)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className={ADMIN_FIELD_CLASS}
        />
        <Button type="submit" disabled={submitting} className="h-11">
          {submitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
