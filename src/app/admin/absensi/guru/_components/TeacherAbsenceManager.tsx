"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  ATTENDANCE_STATUS_BADGES,
  ATTENDANCE_STATUS_LABELS,
} from "@/src/lib/constants";
import { TeacherAbsenceForm } from "./TeacherAbsenceForm";

export interface TeacherAbsenceRow {
  id: string;
  guru: string;
  tanggal: string;
  status: string;
  kelas: string;
  mapel: string;
  jam: string;
  substitute: string | null;
}

interface TeacherAbsenceManagerProps {
  records: TeacherAbsenceRow[];
  guruOptions: { id: string; nama: string }[];
}

export function TeacherAbsenceManager({
  records,
  guruOptions,
}: TeacherAbsenceManagerProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function assignSubstitute(
    absensiGuruId: string,
    substituteTeacherId: string,
  ): Promise<void> {
    if (!substituteTeacherId) {
      return;
    }
    setBusyId(absensiGuruId);
    try {
      const response = await fetch(
        `/api/attendance/teacher-absence/${absensiGuruId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ substituteTeacherId }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal menugaskan pengganti");
      }
      toast.success("Guru pengganti ditugaskan");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <TeacherAbsenceForm guruOptions={guruOptions} />

      <section className="border-hairline rounded-card border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-hairline text-ink-muted border-b text-left text-xs font-semibold uppercase tracking-wide">
                <th className="px-5 py-3">Guru</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jam</th>
                <th className="px-4 py-3">Kelas / Mapel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pengganti</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr
                  key={record.id}
                  className="border-hairline border-b last:border-b-0"
                >
                  <td className="text-ink px-5 py-3 font-semibold">
                    {record.guru}
                  </td>
                  <td className="text-ink px-4 py-3 tabular-nums">
                    {record.tanggal}
                  </td>
                  <td className="text-ink-secondary px-4 py-3 tabular-nums">
                    {record.jam}
                  </td>
                  <td className="text-ink-secondary px-4 py-3">
                    {record.kelas} · {record.mapel}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={ATTENDANCE_STATUS_BADGES[record.status]}>
                      {ATTENDANCE_STATUS_LABELS[record.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {record.substitute ?? (
                      <select
                        disabled={busyId === record.id}
                        defaultValue=""
                        onChange={(event) =>
                          assignSubstitute(record.id, event.target.value)
                        }
                        className="border-hairline-strong text-ink-secondary rounded-input h-9 border bg-white px-2 text-xs"
                      >
                        <option value="" disabled>
                          Pilih pengganti…
                        </option>
                        {guruOptions.map((guru) => (
                          <option key={guru.id} value={guru.id}>
                            {guru.nama}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-ink-muted px-5 py-12 text-center"
                  >
                    Belum ada catatan absensi guru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
