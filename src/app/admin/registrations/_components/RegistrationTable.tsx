"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { SelectField } from "@/src/components/common/SelectField";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";
import { Download } from "lucide-react";
import { DataTable } from "@/src/app/admin/_components/DataTable";
import { StatusFilter } from "./StatusFilter";
import { registrationColumns } from "./RegistrationColumns";
import type { RegistrationWithStudent } from "@/src/features/registration/services";
import { specializationOptions } from "@/src/lib/constants";

interface RegistrationTableProps {
  data: RegistrationWithStudent[];
}

export function RegistrationTable({ data }: RegistrationTableProps) {
  // `""` is "no filter" — the value every `SelectField` emits for its empty row.
  const [programFilter, setProgramFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        if (programFilter && item.specialization !== programFilter) {
          return false;
        }
        if (statusFilter && item.status !== statusFilter) {
          return false;
        }
        return true;
      }),
    [data, programFilter, statusFilter],
  );

  const handleExport = async () => {
    try {
      const response = await fetch("/api/registrations/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: filteredData,
          filters: {
            program: programFilter || undefined,
            status: statusFilter || undefined,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Export gagal");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pendaftaran-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      console.error("Export error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal mengekspor data",
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <SelectField
            ariaLabel="Filter Program"
            className={FILTER_FIELD_CLASS}
            value={programFilter}
            onChange={setProgramFilter}
            emptyLabel="Semua Program"
            options={specializationOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />

          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>

        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </div>

      <DataTable
        columns={registrationColumns}
        data={filteredData}
        searchPlaceholder="Cari nama, NISN, atau sekolah..."
        emptyMessage="Tidak ada data pendaftaran."
      />
    </div>
  );
}
