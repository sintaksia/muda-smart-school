"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { HARI_LABELS, HARI_VALUES } from "@/src/lib/constants";
import { JadwalForm } from "./JadwalForm";

export interface JadwalRow {
  id: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  kelas: string;
  mataPelajaran: string;
  guru: string;
}

export interface OptionItem {
  id: string;
  nama?: string;
}

interface JadwalManagerProps {
  jadwal: JadwalRow[];
  kelasOptions: { id: string; nama: string }[];
  mapelOptions: { id: string; nama: string }[];
  guruOptions: { id: string; nama: string }[];
}

export function JadwalManager({
  jadwal,
  kelasOptions,
  mapelOptions,
  guruOptions,
}: JadwalManagerProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState<boolean>(false);

  async function handleDelete(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/attendance/jadwal/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Gagal menghapus jadwal");
      }
      toast.success("Jadwal dinonaktifkan");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-brand hover:bg-brand-600 active:bg-brand-700 rounded-input h-11 px-5 text-sm font-semibold text-white"
        >
          <Plus className="h-5 w-5" strokeWidth={1.75} />
          Tambah Jadwal
        </Button>
      </div>

      <JadwalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        kelasOptions={kelasOptions}
        mapelOptions={mapelOptions}
        guruOptions={guruOptions}
      />

      {HARI_VALUES.map((hari) => {
        const rows = jadwal.filter((row) => row.hari === hari);
        if (rows.length === 0) {
          return null;
        }
        return (
          <section
            key={hari}
            className="border-hairline rounded-card border bg-white"
          >
            <header className="border-hairline flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-ink text-base font-semibold">
                {HARI_LABELS[hari]}
              </h3>
              <span className="text-ink-muted text-xs font-medium">
                {rows.length} sesi
              </span>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-hairline border-b last:border-b-0"
                    >
                      <td className="text-ink w-32 px-5 py-3 font-semibold tabular-nums">
                        {row.jamMulai}–{row.jamSelesai}
                      </td>
                      <td className="text-ink px-4 py-3">
                        {row.mataPelajaran}
                      </td>
                      <td className="text-ink-secondary px-4 py-3">
                        {row.kelas}
                      </td>
                      <td className="text-ink-secondary px-4 py-3">
                        {row.guru}
                      </td>
                      <td className="w-16 px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="text-ink-muted hover:text-danger transition-colors"
                          aria-label="Nonaktifkan jadwal"
                        >
                          <Trash2 className="h-5 w-5" strokeWidth={1.75} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {jadwal.length === 0 && (
        <div className="border-hairline rounded-card text-ink-muted border bg-white px-5 py-12 text-center text-sm">
          Belum ada jadwal. Tambahkan entri pertama untuk memulai.
        </div>
      )}
    </div>
  );
}
