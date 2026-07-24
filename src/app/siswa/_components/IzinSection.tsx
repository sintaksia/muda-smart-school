"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_BADGES,
  LEAVE_STATUS_LABELS,
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
  const [type, setType] = useState<string>("SICK");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/attendance/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, date, reason }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal mengajukan izin");
      }
      toast.success("Pengajuan terkirim ke wali kelas");
      setReason("");
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
            value={type}
            onChange={(event) => setType(event.target.value)}
            className={inputClass}
          >
            <option value="SICK">Sakit</option>
            <option value="PERMISSION">Izin</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={inputClass}
          />
        </div>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Alasan (mis. demam, acara keluarga)…"
          required
          minLength={3}
          rows={2}
          className="border-hairline-strong text-ink rounded-input w-full border bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting || reason.trim().length < 3}
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
                  {LEAVE_TYPE_LABELS[izin.jenis]} ·{" "}
                  <span className="tabular-nums">{izin.tanggal}</span>
                </p>
                <p className="text-ink-muted max-w-72 truncate text-xs">
                  {izin.alasan}
                </p>
              </div>
              <Badge variant={LEAVE_STATUS_BADGES[izin.status]}>
                {LEAVE_STATUS_LABELS[izin.status]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
