"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { downloadStudentTemplate } from "@/src/features/master/utils/studentExcel";
import { ImportResultSummary } from "./ImportResultSummary";
import type { StudentImportResult } from "@/src/features/master/types";

interface ImportStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Read the first sheet of the uploaded workbook as header-keyed rows. */
async function readSheetRows(file: File): Promise<Record<string, unknown>[]> {
  const { read, utils } = await import("xlsx");
  const workbook = read(await file.arrayBuffer(), { type: "array" });
  const [sheetName] = workbook.SheetNames;
  if (!sheetName) return [];
  return utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[sheetName],
    { raw: false, defval: "" },
  );
}

export function ImportStudentDialog({
  open,
  onOpenChange,
}: ImportStudentDialogProps) {
  const router = useRouter();
  const [importing, setImporting] = useState<boolean>(false);
  const [result, setResult] = useState<StudentImportResult | null>(null);

  async function handleFile(file: File): Promise<void> {
    setImporting(true);
    setResult(null);
    try {
      const rows = await readSheetRows(file);
      if (rows.length === 0) {
        throw new Error("File tidak berisi data");
      }
      const response = await fetch("/api/master/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal mengimpor data siswa");
      }
      setResult(data as StudentImportResult);
      if (data.created > 0) {
        toast.success(`${data.created} siswa berhasil diimpor`);
        router.refresh();
      }
      if (data.failures.length > 0) {
        toast.error(`${data.failures.length} baris gagal diimpor`);
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membaca file Excel",
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-lg sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Impor Siswa dari Excel</DialogTitle>
          <DialogDescription>
            Unduh template, isi datanya, lalu unggah kembali. Setiap baris akan
            dibuatkan akun login dengan password default dari NIS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={downloadStudentTemplate}
          >
            <Download className="mr-2 h-4 w-4" />
            Unduh Template
          </Button>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            disabled={importing}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void handleFile(file);
            }}
            className="border-neutral-300 text-foreground rounded-sm w-full border bg-white p-3 text-sm disabled:opacity-50"
          />

          {importing && (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengimpor data dan membuat akun siswa...
            </p>
          )}

          {result && <ImportResultSummary result={result} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
