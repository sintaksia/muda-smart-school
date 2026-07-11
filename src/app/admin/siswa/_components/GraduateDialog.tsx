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

interface GraduateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siswaList: SiswaRow[];
  kelasOptions: KelasOption[];
}

export function GraduateDialog({
  open,
  onOpenChange,
  siswaList,
  kelasOptions,
}: GraduateDialogProps) {
  const router = useRouter();
  const [kelasId, setKelasId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const students = useMemo(
    () =>
      siswaList.filter(
        (siswa) => siswa.kelasId === kelasId && siswa.status === "AKTIF",
      ),
    [siswaList, kelasId],
  );

  const selectKelas = (id: string) => {
    setKelasId(id);
    setSelectedIds(
      siswaList
        .filter((siswa) => siswa.kelasId === id && siswa.status === "AKTIF")
        .map((siswa) => siswa.id),
    );
  };

  async function submit(): Promise<void> {
    setSubmitting(true);
    try {
      const response = await fetch("/api/master/siswa/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GRADUATE", studentIds: selectedIds }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`${data.count} siswa diluluskan`);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(data.error ?? "Gagal meluluskan siswa");
      }
    } catch {
      toast.error("Gagal meluluskan siswa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kelulusan Siswa</DialogTitle>
          <DialogDescription>
            Tandai siswa aktif sebagai lulus. Kelas terakhir tetap tersimpan
            sebagai riwayat.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={kelasId} onValueChange={selectKelas}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              {kelasOptions
                .filter((kelas) => kelas.tingkat === 12)
                .map((kelas) => (
                  <SelectItem key={kelas.id} value={kelas.id}>
                    {kelas.nama} — {kelas.tahunAjaran}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {kelasId && (
            <StudentChecklist
              students={students}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || selectedIds.length === 0}
          >
            {submitting ? "Memproses..." : "Luluskan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
