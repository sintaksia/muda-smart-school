"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileSpreadsheet, LayoutGrid, List } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { apiRequest } from "@/src/lib/apiRequest";
import {
  findConflictIds,
  type JadwalEntry,
} from "@/src/features/attendance/utils/jadwalGrid";
import { exportJadwalToExcel } from "@/src/features/attendance/utils/exportJadwal";
import { JadwalForm } from "./JadwalForm";
import {
  EMPTY_FILTERS,
  JadwalFilters,
  type JadwalFilterState,
} from "./JadwalFilters";
import { JadwalListView } from "./JadwalListView";
import { JadwalGridView } from "./JadwalGridView";

interface JadwalManagerProps {
  jadwal: JadwalEntry[];
  classOptions: { id: string; name: string }[];
  subjectOptions: { id: string; name: string }[];
  teacherOptions: { id: string; name: string }[];
}

export function JadwalManager({
  jadwal,
  classOptions,
  subjectOptions,
  teacherOptions,
}: JadwalManagerProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [view, setView] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState<JadwalFilterState>(EMPTY_FILTERS);

  const filtered = useMemo(
    () =>
      jadwal.filter(
        (row) =>
          (!filters.dayOfWeek || row.dayOfWeek === filters.dayOfWeek) &&
          (!filters.classId || row.classId === filters.classId) &&
          (!filters.teacherId || row.teacherId === filters.teacherId),
      ),
    [jadwal, filters],
  );
  const conflictIds = useMemo(() => findConflictIds(jadwal), [jadwal]);

  async function handleDelete(id: string): Promise<void> {
    try {
      await apiRequest(
        `/api/attendance/schedules/${id}`,
        "DELETE",
        undefined,
        "Gagal menghapus jadwal",
      );
      toast.success("Jadwal dinonaktifkan");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  }

  const viewButtons = [
    { value: "list" as const, label: "Daftar", icon: List },
    { value: "grid" as const, label: "Grid", icon: LayoutGrid },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <JadwalFilters
          filters={filters}
          onChange={setFilters}
          classOptions={classOptions}
          teacherOptions={teacherOptions}
        />
        <div className="flex items-center gap-3">
          <div className="border-border flex overflow-hidden rounded-sm border text-sm font-medium">
            {viewButtons.map((button) => (
              <button
                key={button.value}
                type="button"
                onClick={() => setView(button.value)}
                className={`flex items-center gap-1.5 px-4 py-1.5 transition-colors ${
                  view === button.value
                    ? "bg-primary-900 text-white"
                    : "text-neutral-600 hover:text-foreground"
                }`}
              >
                <button.icon className="h-4 w-4" strokeWidth={1.75} />
                {button.label}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => exportJadwalToExcel(filtered)}
            disabled={filtered.length === 0}
            className="rounded-sm border-neutral-300 h-11 px-4 text-sm font-semibold"
          >
            <FileSpreadsheet className="h-5 w-5" strokeWidth={1.75} />
            Export Excel
          </Button>
          <CreateButton
            label="Tambah Jadwal"
            onClick={() => setFormOpen(true)}
          />
        </div>
      </div>

      <JadwalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        classOptions={classOptions}
        subjectOptions={subjectOptions}
        teacherOptions={teacherOptions}
      />

      {view === "list" ? (
        <JadwalListView
          jadwal={filtered}
          conflictIds={conflictIds}
          onDelete={handleDelete}
        />
      ) : (
        <JadwalGridView
          entries={filtered}
          conflictIds={conflictIds}
          classOptions={classOptions}
          teacherOptions={teacherOptions}
        />
      )}
    </div>
  );
}
