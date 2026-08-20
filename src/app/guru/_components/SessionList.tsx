"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, QrCode } from "lucide-react";
import { Badge } from "@/src/app/admin/_components/Badge";
import { Button } from "@/src/components/ui/button";
import {
  SESSION_STATUS_BADGES,
  SESSION_STATUS_LABELS,
} from "@/src/lib/constants";

interface SessionItem {
  scheduleId: string;
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

  async function openSession(scheduleId: string): Promise<void> {
    setBusyId(scheduleId);
    try {
      const response = await fetch("/api/attendance/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId }),
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
      <div className="border-border rounded-md text-muted-foreground border bg-white px-5 py-12 text-center text-sm">
        Tidak ada jadwal mengajar hari ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.scheduleId}
          className="border-border rounded-md hover:shadow-sm hover:border-neutral-300 flex items-center justify-between border bg-white p-5 transition-[box-shadow,border-color] duration-150"
        >
          <div className="flex items-center gap-4">
            <div className="text-foreground w-24 text-sm font-semibold tabular-nums">
              {item.jam}
            </div>
            <div>
              <p className="text-foreground text-base font-semibold">
                {item.mapel}
              </p>
              <p className="text-neutral-600 text-sm">{item.kelas}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {item.sesiStatus && (
              <Badge variant={SESSION_STATUS_BADGES[item.sesiStatus]}>
                {SESSION_STATUS_LABELS[item.sesiStatus]}
              </Badge>
            )}
            {item.sesiId && item.sesiStatus !== "NO_CLASS" ? (
              <Button
                type="button"
                variant="link"
                onClick={() => router.push(`/guru/sesi/${item.sesiId}`)}
                className="text-primary-900 hover:text-primary-800 h-auto gap-1 p-0 font-semibold no-underline hover:no-underline"
              >
                Lihat Sesi
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            ) : !item.sesiId ? (
              <Button
                type="button"
                disabled={busyId === item.scheduleId}
                onClick={() => openSession(item.scheduleId)}
                className="h-11 gap-2 px-5 font-semibold"
              >
                <QrCode className="h-5 w-5" strokeWidth={1.75} />
                {busyId === item.scheduleId ? "Membuka..." : "Buka Sesi"}
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
