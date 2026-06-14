"use client";

import { useState, useMemo, useCallback } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Download } from "lucide-react";
import { StatusFilter } from "./StatusFilter";
import { registrationColumns } from "./RegistrationColumns";
import type { PendaftaranWithStudent } from "@/src/features/registration/services";

interface RegistrationTableProps {
  data: PendaftaranWithStudent[];
}

export function RegistrationTable({ data }: RegistrationTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("all");

  // Prepare data with filtering - memoized to avoid reprocessing on every render
  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        if (programFilter !== "all" && item.programKeahlian !== programFilter) {
          return false;
        }
        return true;
      }),
    [data, programFilter],
  );

  const handleStatusFilterChange = useCallback((value: string) => {
    if (value === "all") {
      setColumnFilters((prev) => prev.filter((f) => f.id !== "status"));
    } else {
      setColumnFilters((prev) => [
        ...prev.filter((f) => f.id !== "status"),
        { id: "status", value },
      ]);
    }
  }, []);

  const table = useReactTable({
    data: filteredData,
    columns: registrationColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Handle export to Excel
  const handleExport = async () => {
    try {
      const response = await fetch("/api/registrations/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: filteredData,
          filters: {
            program: programFilter,
            status: columnFilters.find((f) => f.id === "status")?.value,
          },
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pendaftaran-${new Date().toISOString().split("T")[0]}.xlsx`;
        a.click();
      } else {
        throw new Error("Export gagal");
      }
    } catch (error) {
      console.error("Export error:", error);
      // Fallback: show message
      alert("Fitur export akan segera tersedia. Hubungi administrator.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              placeholder="Cari nama, NISN, atau sekolah..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Program Filter */}
          <div className="w-full sm:w-[200px]">
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Program</SelectItem>
                <SelectItem value="TEKNIK_OTOMOTIF">Teknik Otomotif</SelectItem>
                <SelectItem value="PEMROGRAMAN_PERANGKAT_LUNAK_DAN_GIM">
                  Pemrograman PL & Gim
                </SelectItem>
                <SelectItem value="TEKNIK_JARINGAN_KOMPUTER_DAN_TELEKOMUNIKASI">
                  Teknik Jaringan & Telekomunikasi
                </SelectItem>
                <SelectItem value="MANAJEMEN_PERKANTORAN_DAN_LAYANAN_BISNIS">
                  Manajemen Perkantoran
                </SelectItem>
                <SelectItem value="AKUNTANSI_DAN_KEUANGAN_LEMBAGA">
                  Akuntansi & Keuangan
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-[200px]">
            <StatusFilter
              value={
                (columnFilters.find((f) => f.id === "status")
                  ?.value as string) || "all"
              }
              onChange={handleStatusFilterChange}
            />
          </div>
        </div>

        {/* Export Button */}
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={registrationColumns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data pendaftaran.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Menampilkan {table.getRowModel().rows.length} dari{" "}
          {filteredData.length} data
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <span className="text-sm">
            Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
