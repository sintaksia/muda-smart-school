"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DeleteDialog } from "@/src/app/admin/_components/DeleteDialog";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { RosterRow } from "./RosterRow";

export interface SessionDetail {
  id: string;
  status: string;
  qrToken: string | null;
  schedule: {
    startTime: string;
    endTime: string;
    schoolClass: {
      name: string;
      students: { id: string; nis: string; user: { name: string } }[];
    };
    subject: { name: string };
  };
  studentAttendance: {
    id: string;
    studentId: string;
    status: string;
    needsReview: boolean;
    gpsValid: boolean | null;
    scanTime: string | null;
  }[];
}

interface AttendanceRosterProps {
  session: SessionDetail;
  onChanged: () => Promise<void>;
}

interface PendingDelete {
  recordId: string;
  studentName: string;
}

export function AttendanceRoster({
  session,
  onChanged,
}: AttendanceRosterProps) {
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [deleting, setDeleting] = useState<boolean>(false);

  const recordByStudent = new Map(
    session.studentAttendance.map((record) => [record.studentId, record]),
  );
  const isOpen = session.status === "OPEN";

  async function confirmGps(recordId: string): Promise<void> {
    const response = await fetch(`/api/attendance/records/${recordId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearReview: true }),
    });
    if (response.ok) {
      toast.success("Presensi dikonfirmasi");
      await onChanged();
    } else {
      toast.error("Gagal mengonfirmasi presensi");
    }
  }

  async function markManual(studentId: string, status: string): Promise<void> {
    const response = await fetch(`/api/attendance/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "manual-attendance", studentId, status }),
    });
    if (response.ok) {
      toast.success("Presensi manual tercatat");
      await onChanged();
    } else {
      const data = await response.json();
      toast.error(data.error ?? "Gagal mencatat presensi");
    }
  }

  async function removeRecord(): Promise<void> {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/attendance/records/${pendingDelete.recordId}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Gagal menghapus presensi");
      }
      toast.success(`Presensi ${pendingDelete.studentName} dihapus`);
      setPendingDelete(null);
      await onChanged();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus presensi",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="border-border rounded-md border bg-white">
      <header className="border-border flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-foreground text-base font-semibold">
          Daftar {ENTITY_LABELS.STUDENT}
        </h3>
        <span className="text-muted-foreground text-xs font-medium tabular-nums">
          {session.studentAttendance.length}/
          {session.schedule.schoolClass.students.length} tercatat
        </span>
      </header>
      <ul>
        {session.schedule.schoolClass.students.map((student) => (
          <RosterRow
            key={student.id}
            student={student}
            record={recordByStudent.get(student.id)}
            isOpen={isOpen}
            onConfirmGps={(recordId) => void confirmGps(recordId)}
            onMarkManual={(studentId, status) =>
              void markManual(studentId, status)
            }
            onRequestDelete={(record, studentName) =>
              setPendingDelete({ recordId: record.id, studentName })
            }
          />
        ))}
      </ul>

      <DeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={() => void removeRecord()}
        title="Hapus Presensi"
        description={`Hapus presensi ${pendingDelete?.studentName ?? ""}? ${ENTITY_LABELS.STUDENT} ini kembali berstatus belum tercatat dan bisa scan ulang.`}
        isLoading={deleting}
      />
    </section>
  );
}
