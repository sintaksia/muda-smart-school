"use client";

import { Badge } from "@/src/app/admin/_components/Badge";
import { SelectField } from "@/src/components/common/SelectField";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";
import {
  ATTENDANCE_STATUS_BADGES,
  ATTENDANCE_STATUS_LABELS,
  ENTITY_LABELS,
} from "@/src/lib/constants";
import type { TeacherAbsenceRow } from "./TeacherAbsenceManager";

interface TeacherAbsenceTableProps {
  records: TeacherAbsenceRow[];
  teacherOptions: { id: string; name: string }[];
  busyId: string | null;
  onAssignSubstitute: (recordId: string, substituteTeacherId: string) => void;
}

export function TeacherAbsenceTable({
  records,
  teacherOptions,
  busyId,
  onAssignSubstitute,
}: TeacherAbsenceTableProps) {
  return (
    <section className="border-border rounded-md border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border text-muted-foreground border-b text-left text-xs font-semibold uppercase tracking-wide">
              <th className="px-5 py-3">{ENTITY_LABELS.TEACHER}</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Jam</th>
              <th className="px-4 py-3">
                {ENTITY_LABELS.CLASS} / {ENTITY_LABELS.SUBJECT}
              </th>
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
                      searchable
                      ariaLabel={`${ENTITY_LABELS.TEACHER} Pengganti`}
                      placeholder="Pilih pengganti…"
                      disabled={busyId === record.id}
                      value=""
                      onChange={(next) => onAssignSubstitute(record.id, next)}
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
                  Belum ada catatan absensi{" "}
                  {ENTITY_LABELS.TEACHER.toLowerCase()}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
