"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  SPECIALIZATION_SHORT_LABELS,
  specializationOptions,
} from "@/src/lib/constants";

export interface ClassRow {
  id: string;
  name: string;
  gradeLevel: number;
  specialization: string;
  academicYear: string;
  homeroomTeacherId: string | null;
  homeroomTeacher: string | null;
  jumlahSiswa: number;
}

interface ClassManagerProps {
  classList: ClassRow[];
  teacherOptions: { id: string; name: string }[];
}

const inputClass =
  "border-neutral-300 text-foreground rounded-sm h-11 border bg-white px-3 text-sm";

export function ClassManager({ classList, teacherOptions }: ClassManagerProps) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [name, setName] = useState<string>("");
  const [gradeLevel, setGradeLevel] = useState<string>("10");
  const [specialization, setSpecialization] = useState<string>(
    specializationOptions[0].value,
  );
  const [academicYear, setAcademicYear] = useState<string>(
    `${currentYear}/${currentYear + 1}`,
  );
  const [homeroomTeacherId, setHomeroomTeacherId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function request(
    url: string,
    method: string,
    body?: unknown,
  ): Promise<boolean> {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const data = await response.json();
      toast.error(data.error ?? "Terjadi kesalahan");
      return false;
    }
    router.refresh();
    return true;
  }

  async function handleCreate(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    const ok = await request("/api/master/classes", "POST", {
      name,
      gradeLevel: Number(gradeLevel),
      specialization,
      academicYear,
      homeroomTeacherId: homeroomTeacherId || null,
    });
    if (ok) {
      toast.success("Kelas dibuat");
      setName("");
    }
    setSubmitting(false);
  }

  async function changeWali(row: ClassRow, newWaliId: string): Promise<void> {
    const ok = await request(`/api/master/classes/${row.id}`, "PUT", {
      name: row.name,
      gradeLevel: row.gradeLevel,
      specialization: row.specialization,
      academicYear: row.academicYear,
      homeroomTeacherId: newWaliId || null,
    });
    if (ok) {
      toast.success("Wali kelas diperbarui");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm("Hapus kelas ini?")) {
      return;
    }
    const ok = await request(`/api/master/classes/${id}`, "DELETE");
    if (ok) {
      toast.success("Kelas dihapus");
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="border-border rounded-md border bg-white p-5"
      >
        <h3 className="text-foreground mb-4 text-base font-semibold">
          Tambah Kelas
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama (mis. X PPLG 1)"
            required
            minLength={2}
            className={inputClass}
          />
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className={inputClass}
          >
            <option value="10">Kelas 10</option>
            <option value="11">Kelas 11</option>
            <option value="12">Kelas 12</option>
          </select>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className={inputClass}
          >
            {specializationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.short}
              </option>
            ))}
          </select>
          <input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="2026/2027"
            pattern="\d{4}/\d{4}"
            required
            className={`${inputClass} tabular-nums`}
          />
          <select
            value={homeroomTeacherId}
            onChange={(e) => setHomeroomTeacherId(e.target.value)}
            className={inputClass}
          >
            <option value="">Wali kelas (opsional)</option>
            {teacherOptions.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary-900 hover:bg-primary-800 active:bg-primary-950 rounded-sm h-11 px-5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>

      <section className="border-border rounded-md border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs font-semibold uppercase tracking-wide">
                <th className="px-5 py-3">Kelas</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Tahun Ajaran</th>
                <th className="px-4 py-3">Wali Kelas</th>
                <th className="px-4 py-3 text-right">Siswa</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {classList.map((row) => (
                <tr
                  key={row.id}
                  className="border-border border-b last:border-b-0"
                >
                  <td className="text-foreground px-5 py-3 font-semibold">
                    {row.name}
                  </td>
                  <td className="text-neutral-600 px-4 py-3">
                    {SPECIALIZATION_SHORT_LABELS[row.specialization]}
                  </td>
                  <td className="text-neutral-600 px-4 py-3 tabular-nums">
                    {row.academicYear}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.homeroomTeacherId ?? ""}
                      onChange={(e) => changeWali(row, e.target.value)}
                      className="border-neutral-300 text-neutral-600 rounded-sm h-9 border bg-white px-2 text-xs"
                    >
                      <option value="">— Belum ada —</option>
                      {teacherOptions.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-foreground px-4 py-3 text-right font-semibold tabular-nums">
                    {row.jumlahSiswa}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Hapus kelas"
                    >
                      <Trash2 className="h-5 w-5" strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))}
              {classList.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-muted-foreground px-5 py-12 text-center"
                  >
                    Belum ada kelas.
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
