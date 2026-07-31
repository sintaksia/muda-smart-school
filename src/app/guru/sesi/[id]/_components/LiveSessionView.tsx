"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw } from "lucide-react";
import { AttendanceRoster, type SessionDetail } from "./AttendanceRoster";

interface LiveSessionViewProps {
  sesiId: string;
  qrMode: "STATIC" | "DYNAMIC";
  qrTtlSeconds: number;
}

export function LiveSessionView({
  sesiId,
  qrMode,
  qrTtlSeconds,
}: LiveSessionViewProps) {
  const router = useRouter();
  const [sesi, setSesi] = useState<SessionDetail | null>(null);
  const [closing, setClosing] = useState<boolean>(false);

  const load = useCallback(async (): Promise<void> => {
    const response = await fetch(`/api/attendance/sessions/${sesiId}`);
    if (response.ok) {
      setSesi((await response.json()) as SessionDetail);
    }
  }, [sesiId]);

  // Live view: poll scans every 5s while the session is open.
  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 5000);
    return () => clearInterval(interval);
  }, [load]);

  // DYNAMIC mode: rotate the token on the configured TTL.
  useEffect(() => {
    if (qrMode !== "DYNAMIC") {
      return;
    }
    const interval = setInterval(() => void refreshQr(), qrTtlSeconds * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrMode, qrTtlSeconds]);

  async function refreshQr(): Promise<void> {
    const response = await fetch(`/api/attendance/sessions/${sesiId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refresh-qr" }),
    });
    if (response.ok) {
      await load();
    }
  }

  async function closeSession(): Promise<void> {
    if (
      !window.confirm("Tutup sesi? Siswa tanpa presensi akan tercatat Alpa.")
    ) {
      return;
    }
    setClosing(true);
    try {
      const response = await fetch(`/api/attendance/sessions/${sesiId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal menutup sesi");
      }
      toast.success("Sesi ditutup, skor kredit diproses");
      router.push("/guru");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setClosing(false);
    }
  }

  if (!sesi) {
    return <div className="rounded-md bg-primary-50 h-64 animate-pulse" />;
  }

  const isOpen = sesi.status === "OPEN";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            {sesi.jadwal.mataPelajaran.name}
          </h1>
          <p className="text-neutral-600 mt-1 text-sm">
            {sesi.jadwal.kelas.name} · {sesi.jadwal.startTime}–
            {sesi.jadwal.endTime}
          </p>
        </div>
        {isOpen && (
          <button
            type="button"
            disabled={closing}
            onClick={closeSession}
            className="bg-destructive rounded-sm h-11 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {closing ? "Menutup..." : "Tutup Sesi"}
          </button>
        )}
      </div>

      {isOpen && sesi.qrToken && (
        <section className="border-border rounded-md flex flex-col items-center gap-4 border bg-white p-6 sm:flex-row sm:justify-center sm:gap-10">
          <QRCodeSVG value={sesi.qrToken} size={220} marginSize={2} />
          <div className="text-center sm:text-left">
            <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.06em]">
              Kode manual
            </p>
            <p className="text-foreground mt-1 break-all font-mono text-sm font-semibold">
              {sesi.qrToken}
            </p>
            {qrMode === "DYNAMIC" && (
              <button
                type="button"
                onClick={refreshQr}
                className="text-green-600 hover:text-green-500 mt-3 inline-flex items-center gap-1 text-sm font-semibold"
              >
                <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
                Refresh QR
              </button>
            )}
          </div>
        </section>
      )}

      <AttendanceRoster sesi={sesi} onChanged={load} />
    </div>
  );
}
