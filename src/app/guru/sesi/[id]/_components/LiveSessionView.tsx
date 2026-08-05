"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { AttendanceRoster, type SessionDetail } from "./AttendanceRoster";

interface LiveSessionViewProps {
  sessionId: string;
  qrMode: "STATIC" | "DYNAMIC";
  qrTtlSeconds: number;
}

export function LiveSessionView({
  sessionId,
  qrMode,
  qrTtlSeconds,
}: LiveSessionViewProps) {
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [closing, setClosing] = useState<boolean>(false);

  const load = useCallback(async (): Promise<void> => {
    const response = await fetch(`/api/attendance/sessions/${sessionId}`);
    if (response.ok) {
      setSession((await response.json()) as SessionDetail);
    }
  }, [sessionId]);

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
    const response = await fetch(`/api/attendance/sessions/${sessionId}`, {
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
      !window.confirm("Tutup session? Siswa tanpa presensi akan tercatat Alpa.")
    ) {
      return;
    }
    setClosing(true);
    try {
      const response = await fetch(`/api/attendance/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal menutup session");
      }
      toast.success("Sesi ditutup, skor kredit diproses");
      router.push("/guru");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setClosing(false);
    }
  }

  if (!session) {
    return <div className="rounded-md bg-primary-50 h-64 animate-pulse" />;
  }

  const isOpen = session.status === "OPEN";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            {session.schedule.subject.name}
          </h1>
          <p className="text-neutral-600 mt-1 text-sm">
            {session.schedule.schoolClass.name} · {session.schedule.startTime}–
            {session.schedule.endTime}
          </p>
        </div>
        {isOpen && (
          <Button
            type="button"
            variant="destructive"
            disabled={closing}
            onClick={closeSession}
            className="h-11 px-5 font-semibold"
          >
            {closing ? "Menutup..." : "Tutup Sesi"}
          </Button>
        )}
      </div>

      {isOpen && session.qrToken && (
        <section className="border-border rounded-md flex flex-col items-center gap-4 border bg-white p-6 sm:flex-row sm:justify-center sm:gap-10">
          <QRCodeSVG value={session.qrToken} size={220} marginSize={2} />
          <div className="text-center sm:text-left">
            <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.06em]">
              Kode manual
            </p>
            <p className="text-foreground mt-1 break-all font-mono text-sm font-semibold">
              {session.qrToken}
            </p>
            {qrMode === "DYNAMIC" && (
              <Button
                type="button"
                variant="link"
                onClick={refreshQr}
                className="text-green-600 hover:text-green-500 mt-3 h-auto gap-1 p-0 font-semibold no-underline hover:no-underline"
              >
                <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
                Refresh QR
              </Button>
            )}
          </div>
        </section>
      )}

      <AttendanceRoster session={session} onChanged={load} />
    </div>
  );
}
