"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import type { AttendanceScanMode } from "@/src/features/attendance/types";
import { AttendanceRoster, type SessionDetail } from "./AttendanceRoster";
import { CardScanPanel } from "./CardScanPanel";
import { SessionQrPanel } from "./SessionQrPanel";

interface LiveSessionViewProps {
  sessionId: string;
  qrMode: "STATIC" | "DYNAMIC";
  qrTtlSeconds: number;
  scanMode: AttendanceScanMode;
}

export function LiveSessionView({
  sessionId,
  qrMode,
  qrTtlSeconds,
  scanMode,
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

      {isOpen && scanMode !== "STUDENT_SCAN" && (
        <CardScanPanel
          sessionId={sessionId}
          recorded={session.studentAttendance.length}
          total={session.schedule.schoolClass.students.length}
          onChanged={load}
        />
      )}

      {isOpen && scanMode !== "TEACHER_SCAN" && session.qrToken && (
        <SessionQrPanel
          qrToken={session.qrToken}
          qrMode={qrMode}
          onRefresh={refreshQr}
        />
      )}

      <AttendanceRoster session={session} onChanged={load} />
    </div>
  );
}
