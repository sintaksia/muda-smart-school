"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormDialog } from "@/src/components/common/FormDialog";
import { Button } from "@/src/components/ui/button";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { StudentBulkResultSummary } from "./StudentBulkResultSummary";
import type { StudentIntakeResult } from "@/src/features/master/types";

interface RegistrationIntakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accepted registrations that have no student record yet. */
  pendingCount: number;
}

export function RegistrationIntakeDialog({
  open,
  onOpenChange,
  pendingCount,
}: RegistrationIntakeDialogProps) {
  const router = useRouter();
  const [running, setRunning] = useState<boolean>(false);
  const [result, setResult] = useState<StudentIntakeResult | null>(null);

  async function handleIntake(): Promise<void> {
    setRunning(true);
    setResult(null);
    try {
      const response = await fetch("/api/master/students/intake", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal menarik data pendaftaran");
      }
      setResult(data as StudentIntakeResult);
      if (data.created > 0) {
        toast.success(`${data.created} siswa berhasil ditambahkan`);
        router.refresh();
      }
      if (data.failures.length > 0) {
        toast.error(`${data.failures.length} pendaftaran gagal diproses`);
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan server",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Tarik dari Pendaftaran"
      description={`Semua pendaftaran berstatus Diterima yang belum punya data ${ENTITY_LABELS.STUDENT} akan dibuatkan akun. NIS dibuat otomatis dengan format tahun angkatan + nomor urut, dan biodata pendaftaran ikut disalin. Email pendaftaran dipakai bila unik — bila kosong, dipakai bersama beberapa pendaftar, atau sudah terdaftar, email login dibuat otomatis dari NIS.`}
    >
      <div className="space-y-4">
        {!result && (
          <p className="text-foreground text-sm">
            <span className="font-semibold tabular-nums">{pendingCount}</span>{" "}
            pendaftaran siap diproses.
          </p>
        )}

        {result ? (
          <StudentBulkResultSummary
            created={result.created}
            credentials={result.credentials}
            failures={result.failures.map((failure) => ({
              id: failure.registrationNumber,
              label: `${failure.registrationNumber} · ${failure.name}`,
              error: failure.error,
            }))}
          />
        ) : (
          <Button
            type="button"
            onClick={handleIntake}
            disabled={running || pendingCount === 0}
          >
            {running && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {running ? "Memproses..." : "Proses Sekarang"}
          </Button>
        )}
      </div>
    </FormDialog>
  );
}
