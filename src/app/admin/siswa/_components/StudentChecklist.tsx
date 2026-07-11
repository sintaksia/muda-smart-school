"use client";

import type { SiswaRow } from "./types";

interface StudentChecklistProps {
  students: SiswaRow[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export function StudentChecklist({
  students,
  selectedIds,
  onChange,
}: StudentChecklistProps) {
  const allSelected =
    students.length > 0 && selectedIds.length === students.length;

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  };

  if (students.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Tidak ada siswa aktif di kelas ini.
      </p>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto rounded-md border">
      <label className="flex cursor-pointer items-center gap-3 border-b bg-muted/50 px-3 py-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() =>
            onChange(allSelected ? [] : students.map((siswa) => siswa.id))
          }
          className="h-4 w-4"
        />
        Pilih semua ({selectedIds.length}/{students.length})
      </label>
      {students.map((siswa) => (
        <label
          key={siswa.id}
          className="flex cursor-pointer items-center gap-3 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-muted/30"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(siswa.id)}
            onChange={() => toggle(siswa.id)}
            className="h-4 w-4"
          />
          <span className="flex-1">{siswa.nama}</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            NIS {siswa.nis}
          </span>
        </label>
      ))}
    </div>
  );
}
