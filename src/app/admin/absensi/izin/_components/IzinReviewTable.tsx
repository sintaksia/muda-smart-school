"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Badge } from "@/src/app/admin/_components/Badge";
import { Button } from "@/src/components/ui/button";
import {
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_BADGES,
  LEAVE_STATUS_LABELS,
} from "@/src/lib/constants";

interface IzinRow {
  id: string;
  nama: string;
  kelas: string;
  jenis: string;
  tanggal: string;
  alasan: string;
  status: string;
  reviewedBy: string | null;
}

interface IzinReviewTableProps {
  submissions: IzinRow[];
}

export function IzinReviewTable({ submissions }: IzinReviewTableProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(
    id: string,
    decision: "APPROVED" | "REJECTED",
  ): Promise<void> {
    const reviewNote =
      decision === "REJECTED"
        ? (window.prompt("Alasan penolakan (opsional):") ?? undefined)
        : undefined;
    setBusyId(id);
    try {
      const response = await fetch(`/api/attendance/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reviewNote }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal memproses pengajuan");
      }
      toast.success(
        decision === "APPROVED" ? "Pengajuan disetujui" : "Pengajuan ditolak",
      );
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="border-border rounded-md border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border text-muted-foreground border-b text-left text-xs font-semibold uppercase tracking-wide">
              <th className="px-5 py-3">Siswa</th>
              <th className="px-4 py-3">Kelas</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Alasan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((izin) => (
              <tr
                key={izin.id}
                className="border-border border-b last:border-b-0"
              >
                <td className="text-foreground px-5 py-3 font-semibold">
                  {izin.nama}
                </td>
                <td className="text-neutral-600 px-4 py-3">{izin.kelas}</td>
                <td className="text-neutral-600 px-4 py-3">
                  {LEAVE_TYPE_LABELS[izin.jenis]}
                </td>
                <td className="text-foreground px-4 py-3 tabular-nums">
                  {izin.tanggal}
                </td>
                <td className="text-neutral-600 max-w-56 truncate px-4 py-3">
                  {izin.alasan}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={LEAVE_STATUS_BADGES[izin.status]}>
                    {LEAVE_STATUS_LABELS[izin.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {izin.status === "PENDING" ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        disabled={busyId === izin.id}
                        onClick={() => review(izin.id, "APPROVED")}
                        className="bg-green-600 hover:bg-green-500 h-9 gap-1 px-3 text-xs font-semibold text-white"
                      >
                        <Check className="h-4 w-4" strokeWidth={1.75} />
                        Setujui
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busyId === izin.id}
                        onClick={() => review(izin.id, "REJECTED")}
                        className="text-neutral-600 hover:border-destructive hover:text-destructive h-9 gap-1 px-3 text-xs font-semibold"
                      >
                        <X className="h-4 w-4" strokeWidth={1.75} />
                        Tolak
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-right text-xs">
                      {izin.reviewedBy ?? "—"}
                    </p>
                  )}
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-muted-foreground px-5 py-12 text-center"
                >
                  Belum ada pengajuan izin/sakit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
