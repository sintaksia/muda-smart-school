"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileSpreadsheet, LayoutGrid, List, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
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
  kelasOptions: { id: string; nama: string }[];
  mapelOptions: { id: string; nama: string }[];
  guruOptions: { id: string; nama: string }[];
}

export function JadwalManager({
  jadwal,
  kelasOptions,
  mapelOptions,
  guruOptions,
}: JadwalManagerProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [view, setView] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState<JadwalFilterState>(EMPTY_FILTERS);

  const filtered = useMemo(
    () =>
      jadwal.filter(
        (row) =>
          (filters.hari === "ALL" || row.hari === filters.hari) &&
          (filters.kelasId === "ALL" || row.kelasId === filters.kelasId) &&
          (filters.guruId === "ALL" || row.guruId === filters.guruId),
      ),
    [jadwal, filters],
  );
  const conflictIds = useMemo(() => findConflictIds(jadwal), [jadwal]);

  async function handleDelete(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/attendance/jadwal/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Gagal menghapus jadwal");
      }
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
          kelasOptions={kelasOptions}
          guruOptions={guruOptions}
        />
        <div className="flex items-center gap-3">
          <div className="border-hairline flex overflow-hidden rounded-full border text-sm font-medium">
            {viewButtons.map((button) => (
              <button
                key={button.value}
                type="button"
                onClick={() => setView(button.value)}
                className={`flex items-center gap-1.5 px-4 py-1.5 transition-colors ${
                  view === button.value
                    ? "bg-brand text-white"
                    : "text-ink-secondary hover:text-ink"
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
            className="rounded-input border-hairline-strong h-11 px-4 text-sm font-semibold"
          >
            <FileSpreadsheet className="h-5 w-5" strokeWidth={1.75} />
            Export Excel
          </Button>
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-brand hover:bg-brand-600 active:bg-brand-700 rounded-input h-11 px-5 text-sm font-semibold text-white"
          >
            <Plus className="h-5 w-5" strokeWidth={1.75} />
            Tambah Jadwal
          </Button>
        </div>
      </div>

      <JadwalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        kelasOptions={kelasOptions}
        mapelOptions={mapelOptions}
        guruOptions={guruOptions}
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
          kelasOptions={kelasOptions}
          guruOptions={guruOptions}
        />
      )}
    </div>
  );
}
