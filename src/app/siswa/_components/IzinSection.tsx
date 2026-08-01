"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/src/app/admin/_components/Badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { SelectField } from "@/src/components/common/SelectField";
import { ADMIN_FIELD_CLASS } from "@/src/components/common/formClasses";
import {
  leaveTypeOptions,
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

  return (
    <section className="border-border rounded-md border bg-white p-5">
      <h3 className="text-foreground mb-4 text-base font-semibold">
        Ajukan Izin / Sakit
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            ariaLabel="Jenis Pengajuan"
            value={type}
            onChange={setType}
            className={ADMIN_FIELD_CLASS}
            options={leaveTypeOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={ADMIN_FIELD_CLASS}
          />
        </div>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Alasan (mis. demam, acara keluarga)…"
          required
          minLength={3}
          rows={2}
          className="bg-white text-sm"
        />
        <Button
          type="submit"
          disabled={submitting || reason.trim().length < 3}
          className="h-11 w-full"
        >
          {submitting ? "Mengirim..." : "Kirim Pengajuan"}
        </Button>
      </form>

      {submissions.length > 0 && (
        <ul className="border-border mt-5 border-t pt-4">
          {submissions.map((izin) => (
            <li
              key={izin.id}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-foreground text-sm font-semibold">
                  {LEAVE_TYPE_LABELS[izin.jenis]} ·{" "}
                  <span className="tabular-nums">{izin.tanggal}</span>
                </p>
                <p className="text-muted-foreground max-w-72 truncate text-xs">
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
