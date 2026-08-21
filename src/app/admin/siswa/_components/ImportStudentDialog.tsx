"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormDialog } from "@/src/components/common/FormDialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { downloadStudentTemplate } from "@/src/features/master/utils/studentExcel";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { StudentBulkResultSummary } from "./StudentBulkResultSummary";
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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={`Impor ${ENTITY_LABELS.STUDENT} dari Excel`}
      description="Unduh template, isi datanya, lalu unggah kembali. Setiap baris akan dibuatkan akun login dengan password default dari NIS."
    >
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={downloadStudentTemplate}
        >
          <Download className="mr-2 h-4 w-4" />
          Unduh Template
        </Button>

        <Input
          type="file"
          accept=".xlsx,.xls,.csv"
          disabled={importing}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void handleFile(file);
          }}
          className="h-auto bg-white p-3"
        />

        {importing && (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Mengimpor data dan membuat akun siswa...
          </p>
        )}

        {result && (
          <StudentBulkResultSummary
            created={result.created}
            credentials={result.credentials}
            failures={result.failures.map((failure) => ({
              id: `${failure.row}-${failure.nis}`,
              label: `Baris ${failure.row} · ${failure.name || "—"}`,
              error: failure.error,
            }))}
          />
        )}
      </div>
    </FormDialog>
  );
}
