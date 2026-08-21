"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteDialog } from "@/src/app/admin/_components/DeleteDialog";
import { ENTITY_LABELS } from "@/src/lib/constants";
import {
  StudentAttendanceRow,
  type StudentAttendanceRecord,
} from "./StudentAttendanceRow";

interface StudentAttendanceTableProps {
  records: StudentAttendanceRecord[];
  /** True when the day's records hit the query cap and the list is partial. */
  truncated: boolean;
}

const COLUMNS = [
  ENTITY_LABELS.STUDENT,
  ENTITY_LABELS.CLASS,
  "Jam / Mapel",
  "Status",
  "Sumber",
] as const;

export function StudentAttendanceTable({
  records,
  truncated,
}: StudentAttendanceTableProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<StudentAttendanceRecord | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  async function patchRecord(
    recordId: string,
    body: Record<string, unknown>,
    successMessage: string,
  ): Promise<void> {
    setBusyId(recordId);
    try {
      const response = await fetch(`/api/attendance/records/${recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal memperbarui kehadiran");
      }
      toast.success(successMessage);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setBusyId(null);
    }
  }

  async function removeRecord(): Promise<void> {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/attendance/records/${pendingDelete.id}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Gagal menghapus kehadiran");
      }
      toast.success(`Kehadiran ${pendingDelete.studentName} dihapus`);
      setPendingDelete(null);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="border-border rounded-md border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border text-muted-foreground border-b text-left text-xs font-semibold uppercase tracking-wide">
              {COLUMNS.map((column) => (
                <th key={column} className="px-4 py-3 first:px-5">
                  {column}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <StudentAttendanceRow
                key={record.id}
                record={record}
                busy={busyId === record.id}
                onOverride={(recordId, status) =>
                  void patchRecord(
                    recordId,
                    { status },
                    "Status kehadiran diperbarui",
                  )
                }
                onConfirmGps={(recordId) =>
                  void patchRecord(
                    recordId,
                    { clearReview: true },
                    "Kehadiran dikonfirmasi",
                  )
                }
                onRequestDelete={setPendingDelete}
              />
            ))}
            {records.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="text-muted-foreground px-5 py-12 text-center"
                >
                  Belum ada kehadiran tercatat untuk filter ini. Sesi yang belum
                  ditutup baru terisi setelah guru menutup sesi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {truncated && (
        <p className="border-border text-muted-foreground border-t px-5 py-3 text-xs">
          Menampilkan sebagian data. Persempit filter kelas atau status untuk
          melihat sisanya.
        </p>
      )}

      <DeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={() => void removeRecord()}
        isLoading={deleting}
        title="Hapus Catatan Kehadiran"
        description={
          pendingDelete
            ? `Hapus catatan kehadiran ${pendingDelete.studentName} pada ${pendingDelete.time} ${pendingDelete.subjectName}? ${ENTITY_LABELS.STUDENT} akan kembali berstatus belum tercatat.`
            : ""
        }
      />
    </section>
  );
}
