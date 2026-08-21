"use client";

import { SelectField } from "@/src/components/common/SelectField";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";
import { DeleteRowButton } from "@/src/app/admin/_components/DeleteRowButton";
import {
  ENTITY_LABELS,
  SPECIALIZATION_SHORT_LABELS,
} from "@/src/lib/constants";
import type { ClassRow } from "./ClassManager";

interface ClassTableProps {
  rows: ClassRow[];
  teacherOptions: { id: string; name: string }[];
  onChangeHomeroomTeacher: (row: ClassRow, teacherId: string) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
}

export function ClassTable({
  rows,
  teacherOptions,
  onChangeHomeroomTeacher,
  onDelete,
  emptyMessage,
}: ClassTableProps) {
  return (
    <section className="border-border rounded-md border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border text-muted-foreground border-b text-left text-xs font-semibold uppercase tracking-wide">
              <th className="px-5 py-3">{ENTITY_LABELS.CLASS}</th>
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3">Tahun Ajaran</th>
              <th className="px-4 py-3">Wali {ENTITY_LABELS.CLASS}</th>
              <th className="px-4 py-3 text-right">{ENTITY_LABELS.STUDENT}</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-border border-b last:border-b-0"
              >
                <td className="text-foreground px-5 py-3 font-semibold">
                  {row.name}
                </td>
                <td className="text-neutral-600 px-4 py-3">
                  {SPECIALIZATION_SHORT_LABELS[row.specialization]}
                </td>
                <td className="text-neutral-600 px-4 py-3 tabular-nums">
                  {row.academicYear}
                </td>
                <td className="px-4 py-3">
                  <SelectField
                    searchable
                    ariaLabel={`Wali ${ENTITY_LABELS.CLASS}`}
                    value={row.homeroomTeacherId ?? ""}
                    onChange={(next) => onChangeHomeroomTeacher(row, next)}
                    className={FILTER_FIELD_CLASS}
                    emptyLabel="— Belum ada —"
                    options={teacherOptions.map((teacher) => ({
                      value: teacher.id,
                      label: teacher.name,
                    }))}
                  />
                </td>
                <td className="text-foreground px-4 py-3 text-right font-semibold tabular-nums">
                  {row.studentCount}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteRowButton
                    onClick={() => onDelete(row.id)}
                    label={`Hapus ${ENTITY_LABELS.CLASS.toLowerCase()}`}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-muted-foreground px-5 py-12 text-center"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
