"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { DataTable } from "@/src/app/admin/_components/DataTable";
import { siswaColumns } from "./SiswaColumns";
import { SiswaFilters, type SiswaFilterState } from "./SiswaFilters";
import { PromotionDialog } from "./PromotionDialog";
import { GraduateDialog } from "./GraduateDialog";
import type { KelasOption, SiswaRow } from "./types";

interface SiswaTableProps {
  siswaList: SiswaRow[];
  kelasOptions: KelasOption[];
}

const initialFilters: SiswaFilterState = {
  kelasId: "all",
  programKeahlian: "all",
  angkatan: "all",
  status: "all",
};

export function SiswaTable({ siswaList, kelasOptions }: SiswaTableProps) {
  const [filters, setFilters] = useState<SiswaFilterState>(initialFilters);
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [graduateOpen, setGraduateOpen] = useState(false);

  const angkatanOptions = useMemo(
    () =>
      [...new Set(siswaList.map((siswa) => siswa.angkatan))].sort(
        (a, b) => b - a,
      ),
    [siswaList],
  );

  const filteredData = useMemo(
    () =>
      siswaList.filter((siswa) => {
        if (filters.kelasId === "none" && siswa.kelasId !== null) return false;
        if (
          filters.kelasId !== "all" &&
          filters.kelasId !== "none" &&
          siswa.kelasId !== filters.kelasId
        )
          return false;
        if (
          filters.programKeahlian !== "all" &&
          siswa.programKeahlian !== filters.programKeahlian
        )
          return false;
        if (
          filters.angkatan !== "all" &&
          String(siswa.angkatan) !== filters.angkatan
        )
          return false;
        if (filters.status !== "all" && siswa.status !== filters.status)
          return false;
        return true;
      }),
    [siswaList, filters],
  );

  return (
    <div className="space-y-4 rounded-lg border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SiswaFilters
          filters={filters}
          onChange={setFilters}
          kelasOptions={kelasOptions}
          angkatanOptions={angkatanOptions}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPromotionOpen(true)}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Kenaikan Kelas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGraduateOpen(true)}
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Kelulusan
          </Button>
        </div>
      </div>

      <DataTable
        columns={siswaColumns}
        data={filteredData}
        searchPlaceholder="Cari nama / NIS / NISN..."
        emptyMessage="Belum ada siswa. Akun siswa dibuat dari pendaftaran yang diterima atau tombol Tambah Siswa."
      />

      <PromotionDialog
        open={promotionOpen}
        onOpenChange={setPromotionOpen}
        siswaList={siswaList}
        kelasOptions={kelasOptions}
      />
      <GraduateDialog
        open={graduateOpen}
        onOpenChange={setGraduateOpen}
        siswaList={siswaList}
        kelasOptions={kelasOptions}
      />
    </div>
  );
}
