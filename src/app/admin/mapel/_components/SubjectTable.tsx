"use client";

import { DeleteRowButton } from "@/src/app/admin/_components/DeleteRowButton";
import {
  ENTITY_LABELS,
  SPECIALIZATION_SHORT_LABELS,
} from "@/src/lib/constants";
import type { SubjectRow } from "./SubjectManager";

interface SubjectTableProps {
  rows: SubjectRow[];
  onDelete: (id: string) => void;
}

export function SubjectTable({ rows, onDelete }: SubjectTableProps) {
  return (
    <section className="border-border rounded-md border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border text-muted-foreground border-b text-left text-xs font-semibold uppercase tracking-wide">
              <th className="px-5 py-3">Kode</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3 text-right">{ENTITY_LABELS.TEACHER}</th>
              <th className="px-4 py-3 text-right">Jadwal</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-border border-b last:border-b-0"
              >
                <td className="text-foreground px-5 py-3 font-mono font-semibold">
                  {row.code}
                </td>
                <td className="text-foreground px-4 py-3">{row.name}</td>
                <td className="text-neutral-600 px-4 py-3">
                  {row.specialization
                    ? SPECIALIZATION_SHORT_LABELS[row.specialization]
                    : "Umum"}
                </td>
                <td className="text-neutral-600 px-4 py-3 text-right tabular-nums">
                  {row.jumlahGuru}
                </td>
                <td className="text-neutral-600 px-4 py-3 text-right tabular-nums">
                  {row.jumlahJadwal}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteRowButton
                    onClick={() => onDelete(row.id)}
                    label={`Hapus ${ENTITY_LABELS.SUBJECT.toLowerCase()}`}
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
                  Belum ada {ENTITY_LABELS.SUBJECT.toLowerCase()}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
