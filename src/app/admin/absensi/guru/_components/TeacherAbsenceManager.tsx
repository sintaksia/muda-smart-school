"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/src/app/admin/_components/Badge";
import { SelectField } from "@/src/components/common/SelectField";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";
import {
  ATTENDANCE_STATUS_BADGES,
  ATTENDANCE_STATUS_LABELS,
} from "@/src/lib/constants";
import { TeacherAbsenceForm } from "./TeacherAbsenceForm";

export interface TeacherAbsenceRow {
  id: string;
  teacherName: string;
  date: string;
  status: string;
  className: string;
  subjectName: string;
  time: string;
  substitute: string | null;
}

interface TeacherAbsenceManagerProps {
  records: TeacherAbsenceRow[];
  teacherOptions: { id: string; name: string }[];
}

export function TeacherAbsenceManager({
  records,
  teacherOptions,
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
      <TeacherAbsenceForm teacherOptions={teacherOptions} />

      <section className="border-border rounded-md border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs font-semibold uppercase tracking-wide">
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
                  className="border-border border-b last:border-b-0"
                >
                  <td className="text-foreground px-5 py-3 font-semibold">
                    {record.teacherName}
                  </td>
                  <td className="text-foreground px-4 py-3 tabular-nums">
                    {record.date}
                  </td>
                  <td className="text-neutral-600 px-4 py-3 tabular-nums">
                    {record.time}
                  </td>
                  <td className="text-neutral-600 px-4 py-3">
                    {record.className} · {record.subjectName}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={ATTENDANCE_STATUS_BADGES[record.status]}>
                      {ATTENDANCE_STATUS_LABELS[record.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {record.substitute ?? (
                      <SelectField
                        ariaLabel="Guru Pengganti"
                        placeholder="Pilih pengganti…"
                        disabled={busyId === record.id}
                        value=""
                        onChange={(next) => assignSubstitute(record.id, next)}
                        className={FILTER_FIELD_CLASS}
                        options={teacherOptions.map((teacher) => ({
                          value: teacher.id,
                          label: teacher.name,
                        }))}
                      />
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-muted-foreground px-5 py-12 text-center"
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
