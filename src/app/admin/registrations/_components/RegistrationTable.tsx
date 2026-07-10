"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Download } from "lucide-react";
import { DataTable } from "@/src/app/admin/_components/DataTable";
import { StatusFilter } from "./StatusFilter";
import { registrationColumns } from "./RegistrationColumns";
import type { PendaftaranWithStudent } from "@/src/features/registration/services";
import { programKeahlianOptions } from "@/src/lib/constants";

interface RegistrationTableProps {
  data: PendaftaranWithStudent[];
}

export function RegistrationTable({ data }: RegistrationTableProps) {
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        if (programFilter !== "all" && item.programKeahlian !== programFilter) {
          return false;
        }
        if (statusFilter !== "all" && item.status !== statusFilter) {
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
            program: programFilter,
            status: statusFilter === "all" ? undefined : statusFilter,
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
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          <div className="w-full sm:w-[220px]">
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Program</SelectItem>
                {programKeahlianOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-[200px]">
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          </div>
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
