"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { SelectField } from "@/src/components/common/SelectField";
import { ADMIN_FIELD_CLASS } from "@/src/components/common/formClasses";
import { DeleteRowButton } from "@/src/app/admin/_components/DeleteRowButton";
import {
  SPECIALIZATION_SHORT_LABELS,
  specializationOptions,
} from "@/src/lib/constants";

export interface SubjectRow {
  id: string;
  name: string;
  code: string;
  specialization: string | null;
  gradeLevel: number | null;
  jumlahGuru: number;
  jumlahJadwal: number;
}

interface SubjectManagerProps {
  subjectList: SubjectRow[];
}

export function SubjectManager({ subjectList }: SubjectManagerProps) {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function handleCreate(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/master/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          specialization: specialization || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal membuat mapel");
      }
      toast.success("Mapel dibuat");
      setName("");
      setCode("");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm("Hapus mata pelajaran ini?")) {
      return;
    }
    const response = await fetch(`/api/master/subjects/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      toast.success("Mapel dihapus");
      router.refresh();
    } else {
      const data = await response.json();
      toast.error(data.error ?? "Gagal menghapus mapel");
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="border-border rounded-md border bg-white p-5"
      >
        <h3 className="text-foreground mb-4 text-base font-semibold">
          Tambah Mata Pelajaran
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama (mis. Matematika)"
            required
            minLength={2}
            className={ADMIN_FIELD_CLASS}
          />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
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
          <Button type="submit" disabled={submitting} className="h-11">
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>

      <section className="border-border rounded-md border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs font-semibold uppercase tracking-wide">
                <th className="px-5 py-3">Kode</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3 text-right">Guru</th>
                <th className="px-4 py-3 text-right">Jadwal</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {subjectList.map((row) => (
                <tr
                  key={row.id}
                  className="border-border border-b last:border-b-0"
                >
                  <td className="text-foreground px-5 py-3 font-mono font-semibold">
                    {row.code}
                  </td>
                  <td className="text-foreground px-4 py-3">{row.name}</td>
                  <td className="text-neutral-600 px-4 py-3">
                    {row.specialization
                      ? SPECIALIZATION_SHORT_LABELS[row.specialization]
                      : "Umum"}
                  </td>
                  <td className="text-neutral-600 px-4 py-3 text-right tabular-nums">
                    {row.jumlahGuru}
                  </td>
                  <td className="text-neutral-600 px-4 py-3 text-right tabular-nums">
                    {row.jumlahJadwal}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteRowButton
                      onClick={() => handleDelete(row.id)}
                      label="Hapus mapel"
                    />
                  </td>
                </tr>
              ))}
              {subjectList.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-muted-foreground px-5 py-12 text-center"
                  >
                    Belum ada mata pelajaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
