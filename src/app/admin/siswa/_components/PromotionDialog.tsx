"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { StudentChecklist } from "./StudentChecklist";
import type { KelasOption, SiswaRow } from "./types";

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siswaList: SiswaRow[];
  kelasOptions: KelasOption[];
}

export function PromotionDialog({
  open,
  onOpenChange,
  siswaList,
  kelasOptions,
}: PromotionDialogProps) {
  const router = useRouter();
  const [sourceKelasId, setSourceKelasId] = useState("");
  const [targetKelasId, setTargetKelasId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const sourceKelas = kelasOptions.find((kelas) => kelas.id === sourceKelasId);
  const students = useMemo(
    () =>
      siswaList.filter(
        (siswa) => siswa.kelasId === sourceKelasId && siswa.status === "AKTIF",
      ),
    [siswaList, sourceKelasId],
  );
  const targetOptions = useMemo(
    () =>
      sourceKelas
        ? kelasOptions.filter(
            (kelas) =>
              kelas.tingkat === sourceKelas.tingkat + 1 &&
              kelas.id !== sourceKelas.id,
          )
        : [],
    [kelasOptions, sourceKelas],
  );

  const selectSource = (kelasId: string) => {
    setSourceKelasId(kelasId);
    setTargetKelasId("");
    setSelectedIds(
      siswaList
        .filter(
          (siswa) => siswa.kelasId === kelasId && siswa.status === "AKTIF",
        )
        .map((siswa) => siswa.id),
    );
  };

  async function submit(): Promise<void> {
    setSubmitting(true);
    try {
      const response = await fetch("/api/master/siswa/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PROMOTE",
          studentIds: selectedIds,
          targetKelasId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`${data.count} siswa naik kelas`);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(data.error ?? "Gagal memproses kenaikan kelas");
      }
    } catch {
      toast.error("Gagal memproses kenaikan kelas");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kenaikan Kelas</DialogTitle>
          <DialogDescription>
            Pindahkan siswa aktif dari satu kelas ke kelas tingkat berikutnya.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={sourceKelasId} onValueChange={selectSource}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kelas asal" />
            </SelectTrigger>
            <SelectContent>
              {kelasOptions.map((kelas) => (
                <SelectItem key={kelas.id} value={kelas.id}>
                  {kelas.nama} — {kelas.tahunAjaran}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {sourceKelasId && (
            <StudentChecklist
              students={students}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
            />
          )}

          {sourceKelas && targetOptions.length === 0 && (
            <p className="text-sm text-yellow-700">
              Belum ada kelas tingkat {sourceKelas.tingkat + 1}. Buat kelas
              tujuan di menu Kelas terlebih dahulu.
            </p>
          )}

          {sourceKelas && targetOptions.length > 0 && (
            <Select value={targetKelasId} onValueChange={setTargetKelasId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas tujuan" />
              </SelectTrigger>
              <SelectContent>
                {targetOptions.map((kelas) => (
                  <SelectItem key={kelas.id} value={kelas.id}>
                    {kelas.nama} — {kelas.tahunAjaran}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || selectedIds.length === 0 || !targetKelasId}
          >
            {submitting ? "Memproses..." : "Naikkan Kelas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
