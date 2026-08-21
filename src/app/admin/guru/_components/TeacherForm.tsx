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
import {
  genderOptions,
  educationOptions,
  employmentStatusOptions,
  ENTITY_LABELS,
} from "@/src/lib/constants";

interface TeacherFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectOptions: { id: string; name: string }[];
}

const initialState = {
  name: "",
  email: "",
  password: "",
  phone: "",
  nip: "",
  gender: "MALE",
  birthPlace: "",
  birthDate: "1990-01-01",
  education: "S1",
  employmentStatus: "GTY",
};

export function TeacherForm({
  open,
  onOpenChange,
  subjectOptions,
}: TeacherFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  function set(field: keyof typeof initialState, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSubject(id: string): void {
    setSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (subjectIds.length === 0) {
      toast.error("Pilih minimal satu mata pelajaran");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest(
        "/api/master/teachers",
        "POST",
        {
          ...form,
          phone: form.phone || undefined,
          nip: form.nip || undefined,
          subjectIds,
        },
        `Gagal membuat akun ${ENTITY_LABELS.TEACHER.toLowerCase()}`,
      );
      toast.success(`Akun ${ENTITY_LABELS.TEACHER.toLowerCase()} dibuat`);
      setForm(initialState);
      setSubjectIds([]);
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
      title={`Tambah ${ENTITY_LABELS.TEACHER}`}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Nama lengkap"
          required
          minLength={3}
          className={ADMIN_FIELD_CLASS}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="Email"
            required
            className={ADMIN_FIELD_CLASS}
          />
          <Input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Password (min. 8)"
            required
            minLength={8}
            className={ADMIN_FIELD_CLASS}
          />
          <Input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="No. HP (opsional)"
            className={ADMIN_FIELD_CLASS}
          />
          <Input
            value={form.nip}
            onChange={(e) => set("nip", e.target.value)}
            placeholder="NIP (opsional)"
            className={ADMIN_FIELD_CLASS}
          />
          <SelectField
            ariaLabel="Jenis Kelamin"
            value={form.gender}
            onChange={(next) => set("gender", next)}
            className={ADMIN_FIELD_CLASS}
            options={genderOptions.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
          <SelectField
            ariaLabel="Status Kepegawaian"
            value={form.employmentStatus}
            onChange={(next) => set("employmentStatus", next)}
            className={ADMIN_FIELD_CLASS}
            options={employmentStatusOptions.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
          <Input
            value={form.birthPlace}
            onChange={(e) => set("birthPlace", e.target.value)}
            placeholder="Tempat lahir"
            required
            minLength={2}
            className={ADMIN_FIELD_CLASS}
          />
          <DateField
            ariaLabel="Tanggal lahir"
            value={form.birthDate}
            onChange={(next) => set("birthDate", next)}
            birthDate
            className={ADMIN_FIELD_CLASS}
          />
        </div>
        <SelectField
          ariaLabel="Pendidikan Terakhir"
          value={form.education}
          onChange={(next) => set("education", next)}
          className={ADMIN_FIELD_CLASS}
          options={educationOptions.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
        />

        <fieldset className="border-border rounded-sm border p-3">
          <legend className="text-neutral-600 px-1 text-xs font-semibold">
            Kualifikasi Mata Pelajaran
          </legend>
          {subjectOptions.length === 0 ? (
            <p className="text-yellow-600 text-xs font-semibold">
              Belum ada mapel — buat dulu di menu Mata Pelajaran.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {subjectOptions.map((subject) => (
                <label
                  key={subject.id}
                  className="text-foreground flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={subjectIds.includes(subject.id)}
                    onChange={() => toggleSubject(subject.id)}
                    className="accent-primary-900"
                  />
                  {subject.name}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <FormDialogActions
          onCancel={() => onOpenChange(false)}
          submitting={submitting}
          submitLabel={`Buat Akun ${ENTITY_LABELS.TEACHER}`}
        />
      </form>
    </FormDialog>
  );
}
