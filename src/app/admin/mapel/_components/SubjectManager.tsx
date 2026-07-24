"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  SPECIALIZATION_SHORT_LABELS,
  specializationOptions,
} from "@/src/lib/constants";

export interface MapelRow {
  id: string;
  name: string;
  code: string;
  specialization: string | null;
  gradeLevel: number | null;
  jumlahGuru: number;
  jumlahJadwal: number;
}

interface MapelManagerProps {
  subjectList: MapelRow[];
}

const inputClass =
  "border-hairline-strong text-ink rounded-input h-11 border bg-white px-3 text-sm";

export function MapelManager({ subjectList }: MapelManagerProps) {
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
      const response = await fetch("/api/master/mapel", {
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
    const response = await fetch(`/api/master/mapel/${id}`, {
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
        className="border-hairline rounded-card border bg-white p-5"
      >
        <h3 className="text-ink mb-4 text-base font-semibold">
          Tambah Mata Pelajaran
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama (mis. Matematika)"
            required
            minLength={2}
            className={inputClass}
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Kode (mis. MTK)"
            required
            minLength={2}
            maxLength={12}
            className={`${inputClass} font-mono uppercase`}
          />
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className={inputClass}
          >
            <option value="">Umum (semua program)</option>
            {specializationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.short}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand hover:bg-brand-600 active:bg-brand-700 rounded-input h-11 px-5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>

      <section className="border-hairline rounded-card border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-hairline text-ink-muted border-b text-left text-xs font-semibold uppercase tracking-wide">
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
                  className="border-hairline border-b last:border-b-0"
                >
                  <td className="text-ink px-5 py-3 font-mono font-semibold">
                    {row.code}
                  </td>
                  <td className="text-ink px-4 py-3">{row.name}</td>
                  <td className="text-ink-secondary px-4 py-3">
                    {row.specialization
                      ? SPECIALIZATION_SHORT_LABELS[row.specialization]
                      : "Umum"}
                  </td>
                  <td className="text-ink-secondary px-4 py-3 text-right tabular-nums">
                    {row.jumlahGuru}
                  </td>
                  <td className="text-ink-secondary px-4 py-3 text-right tabular-nums">
                    {row.jumlahJadwal}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      className="text-ink-muted hover:text-danger transition-colors"
                      aria-label="Hapus mapel"
                    >
                      <Trash2 className="h-5 w-5" strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))}
              {subjectList.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-ink-muted px-5 py-12 text-center"
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
