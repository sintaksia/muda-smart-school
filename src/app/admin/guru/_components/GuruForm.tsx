"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  genderOptions,
  educationOptions,
  employmentStatusOptions,
} from "@/src/lib/constants";

interface GuruFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectOptions: { id: string; name: string }[];
}

const inputClass =
  "border-hairline-strong text-ink rounded-input h-11 w-full border bg-white px-3 text-sm";

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

export function GuruForm({
  open,
  onOpenChange,
  subjectOptions,
}: GuruFormProps) {
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
      const response = await fetch("/api/master/guru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: form.phone || undefined,
          nip: form.nip || undefined,
          subjectIds,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal membuat akun guru");
      }
      toast.success("Akun guru dibuat");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-modal max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-ink">Tambah Guru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Nama lengkap"
            required
            minLength={3}
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="Email"
              required
              className={inputClass}
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Password (min. 8)"
              required
              minLength={8}
              className={inputClass}
            />
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="No. HP (opsional)"
              className={inputClass}
            />
            <input
              value={form.nip}
              onChange={(e) => set("nip", e.target.value)}
              placeholder="NIP (opsional)"
              className={inputClass}
            />
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              className={inputClass}
            >
              {genderOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={form.employmentStatus}
              onChange={(e) => set("employmentStatus", e.target.value)}
              className={inputClass}
            >
              {employmentStatusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              value={form.birthPlace}
              onChange={(e) => set("birthPlace", e.target.value)}
              placeholder="Tempat lahir"
              required
              minLength={2}
              className={inputClass}
            />
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => set("birthDate", e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <select
            value={form.education}
            onChange={(e) => set("education", e.target.value)}
            className={inputClass}
          >
            {educationOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <fieldset className="border-hairline rounded-input border p-3">
            <legend className="text-ink-secondary px-1 text-xs font-semibold">
              Kualifikasi Mata Pelajaran
            </legend>
            {subjectOptions.length === 0 ? (
              <p className="text-warning text-xs font-semibold">
                Belum ada mapel — buat dulu di menu Mata Pelajaran.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {subjectOptions.map((subject) => (
                  <label
                    key={subject.id}
                    className="text-ink flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={subjectIds.includes(subject.id)}
                      onChange={() => toggleSubject(subject.id)}
                      className="accent-[var(--color-brand)]"
                    />
                    {subject.name}
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="bg-brand hover:bg-brand-600 active:bg-brand-700 rounded-input h-11 w-full text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Buat Akun Guru"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
