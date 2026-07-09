"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  PROGRAM_KEAHLIAN_SHORT_LABELS,
  programKeahlianOptions,
} from "@/src/lib/constants";

export interface KelasRow {
  id: string;
  nama: string;
  tingkat: number;
  programKeahlian: string;
  tahunAjaran: string;
  waliKelasId: string | null;
  waliKelas: string | null;
  jumlahSiswa: number;
}

interface KelasManagerProps {
  kelasList: KelasRow[];
  guruOptions: { id: string; nama: string }[];
}

const inputClass =
  "border-hairline-strong text-ink rounded-input h-11 border bg-white px-3 text-sm";

export function KelasManager({ kelasList, guruOptions }: KelasManagerProps) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [nama, setNama] = useState<string>("");
  const [tingkat, setTingkat] = useState<string>("10");
  const [programKeahlian, setProgramKeahlian] = useState<string>(
    programKeahlianOptions[0].value,
  );
  const [tahunAjaran, setTahunAjaran] = useState<string>(
    `${currentYear}/${currentYear + 1}`,
  );
  const [waliKelasId, setWaliKelasId] = useState<string>("");
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
    const ok = await request("/api/master/kelas", "POST", {
      nama,
      tingkat: Number(tingkat),
      programKeahlian,
      tahunAjaran,
      waliKelasId: waliKelasId || null,
    });
    if (ok) {
      toast.success("Kelas dibuat");
      setNama("");
    }
    setSubmitting(false);
  }

  async function changeWali(row: KelasRow, newWaliId: string): Promise<void> {
    const ok = await request(`/api/master/kelas/${row.id}`, "PUT", {
      nama: row.nama,
      tingkat: row.tingkat,
      programKeahlian: row.programKeahlian,
      tahunAjaran: row.tahunAjaran,
      waliKelasId: newWaliId || null,
    });
    if (ok) {
      toast.success("Wali kelas diperbarui");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm("Hapus kelas ini?")) {
      return;
    }
    const ok = await request(`/api/master/kelas/${id}`, "DELETE");
    if (ok) {
      toast.success("Kelas dihapus");
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="border-hairline rounded-card border bg-white p-5"
      >
        <h3 className="text-ink mb-4 text-base font-semibold">Tambah Kelas</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama (mis. X PPLG 1)"
            required
            minLength={2}
            className={inputClass}
          />
          <select
            value={tingkat}
            onChange={(e) => setTingkat(e.target.value)}
            className={inputClass}
          >
            <option value="10">Kelas 10</option>
            <option value="11">Kelas 11</option>
            <option value="12">Kelas 12</option>
          </select>
          <select
            value={programKeahlian}
            onChange={(e) => setProgramKeahlian(e.target.value)}
            className={inputClass}
          >
            {programKeahlianOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.short}
              </option>
            ))}
          </select>
          <input
            value={tahunAjaran}
            onChange={(e) => setTahunAjaran(e.target.value)}
            placeholder="2026/2027"
            pattern="\d{4}/\d{4}"
            required
            className={`${inputClass} tabular-nums`}
          />
          <select
            value={waliKelasId}
            onChange={(e) => setWaliKelasId(e.target.value)}
            className={inputClass}
          >
            <option value="">Wali kelas (opsional)</option>
            {guruOptions.map((guru) => (
              <option key={guru.id} value={guru.id}>
                {guru.nama}
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
                <th className="px-5 py-3">Kelas</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Tahun Ajaran</th>
                <th className="px-4 py-3">Wali Kelas</th>
                <th className="px-4 py-3 text-right">Siswa</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kelasList.map((row) => (
                <tr
                  key={row.id}
                  className="border-hairline border-b last:border-b-0"
                >
                  <td className="text-ink px-5 py-3 font-semibold">
                    {row.nama}
                  </td>
                  <td className="text-ink-secondary px-4 py-3">
                    {PROGRAM_KEAHLIAN_SHORT_LABELS[row.programKeahlian]}
                  </td>
                  <td className="text-ink-secondary px-4 py-3 tabular-nums">
                    {row.tahunAjaran}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.waliKelasId ?? ""}
                      onChange={(e) => changeWali(row, e.target.value)}
                      className="border-hairline-strong text-ink-secondary rounded-input h-9 border bg-white px-2 text-xs"
                    >
                      <option value="">— Belum ada —</option>
                      {guruOptions.map((guru) => (
                        <option key={guru.id} value={guru.id}>
                          {guru.nama}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-ink px-4 py-3 text-right font-semibold tabular-nums">
                    {row.jumlahSiswa}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      className="text-ink-muted hover:text-danger transition-colors"
                      aria-label="Hapus kelas"
                    >
                      <Trash2 className="h-5 w-5" strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))}
              {kelasList.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-ink-muted px-5 py-12 text-center"
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
