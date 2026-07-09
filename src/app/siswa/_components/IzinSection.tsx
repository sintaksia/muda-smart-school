"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  IZIN_JENIS_LABELS,
  IZIN_STATUS_BADGES,
  IZIN_STATUS_LABELS,
} from "@/src/lib/constants";

interface IzinItem {
  id: string;
  jenis: string;
  tanggal: string;
  alasan: string;
  status: string;
}

interface IzinSectionProps {
  submissions: IzinItem[];
}

export function IzinSection({ submissions }: IzinSectionProps) {
  const router = useRouter();
  const [jenis, setJenis] = useState<string>("SAKIT");
  const [tanggal, setTanggal] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [alasan, setAlasan] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/attendance/izin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jenis, tanggal, alasan }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal mengajukan izin");
      }
      toast.success("Pengajuan terkirim ke wali kelas");
      setAlasan("");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "border-hairline-strong text-ink rounded-input h-11 border bg-white px-3 text-sm";

  return (
    <section className="border-hairline rounded-card border bg-white p-5">
      <h3 className="text-ink mb-4 text-base font-semibold">
        Ajukan Izin / Sakit
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <select
            value={jenis}
            onChange={(event) => setJenis(event.target.value)}
            className={inputClass}
          >
            <option value="SAKIT">Sakit</option>
            <option value="IZIN">Izin</option>
          </select>
          <input
            type="date"
            value={tanggal}
            onChange={(event) => setTanggal(event.target.value)}
            className={inputClass}
          />
        </div>
        <textarea
          value={alasan}
          onChange={(event) => setAlasan(event.target.value)}
          placeholder="Alasan (mis. demam, acara keluarga)…"
          required
          minLength={3}
          rows={2}
          className="border-hairline-strong text-ink rounded-input w-full border bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting || alasan.trim().length < 3}
          className="bg-brand hover:bg-brand-600 active:bg-brand-700 rounded-input h-11 w-full text-sm font-semibold text-white transition-colors disabled:opacity-50"
        >
          {submitting ? "Mengirim..." : "Kirim Pengajuan"}
        </button>
      </form>

      {submissions.length > 0 && (
        <ul className="border-hairline mt-5 border-t pt-4">
          {submissions.map((izin) => (
            <li
              key={izin.id}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-ink text-sm font-semibold">
                  {IZIN_JENIS_LABELS[izin.jenis]} ·{" "}
                  <span className="tabular-nums">{izin.tanggal}</span>
                </p>
                <p className="text-ink-muted max-w-72 truncate text-xs">
                  {izin.alasan}
                </p>
              </div>
              <Badge variant={IZIN_STATUS_BADGES[izin.status]}>
                {IZIN_STATUS_LABELS[izin.status]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
