"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, QrCode } from "lucide-react";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  SESSION_STATUS_BADGES,
  SESSION_STATUS_LABELS,
} from "@/src/lib/constants";

interface SessionItem {
  jadwalId: string;
  jam: string;
  kelas: string;
  mapel: string;
  sesiId: string | null;
  sesiStatus: string | null;
}

interface SessionListProps {
  items: SessionItem[];
}

export function SessionList({ items }: SessionListProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function openSession(jadwalId: string): Promise<void> {
    setBusyId(jadwalId);
    try {
      const response = await fetch("/api/attendance/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jadwalId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal membuka sesi");
      }
      if (data.status === "NO_CLASS") {
        toast.warning("Sesi ditandai kelas kosong (guru berhalangan)");
        router.refresh();
        return;
      }
      router.push(`/guru/sesi/${data.id}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="border-hairline rounded-card text-ink-muted border bg-white px-5 py-12 text-center text-sm">
        Tidak ada jadwal mengajar hari ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.jadwalId}
          className="border-hairline rounded-card hover:shadow-hover hover:border-hairline-strong flex items-center justify-between border bg-white p-5 transition-[box-shadow,border-color] duration-150"
        >
          <div className="flex items-center gap-4">
            <div className="text-ink w-24 text-sm font-semibold tabular-nums">
              {item.jam}
            </div>
            <div>
              <p className="text-ink text-base font-semibold">{item.mapel}</p>
              <p className="text-ink-secondary text-sm">{item.kelas}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {item.sesiStatus && (
              <Badge variant={SESSION_STATUS_BADGES[item.sesiStatus]}>
                {SESSION_STATUS_LABELS[item.sesiStatus]}
              </Badge>
            )}
            {item.sesiId && item.sesiStatus !== "NO_CLASS" ? (
              <button
                type="button"
                onClick={() => router.push(`/guru/sesi/${item.sesiId}`)}
                className="text-brand hover:text-brand-600 inline-flex items-center gap-1 text-sm font-semibold"
              >
                Lihat Sesi
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            ) : !item.sesiId ? (
              <button
                type="button"
                disabled={busyId === item.jadwalId}
                onClick={() => openSession(item.jadwalId)}
                className="bg-brand hover:bg-brand-600 active:bg-brand-700 rounded-input inline-flex h-11 items-center gap-2 px-5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
              >
                <QrCode className="h-5 w-5" strokeWidth={1.75} />
                {busyId === item.jadwalId ? "Membuka..." : "Buka Sesi"}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
