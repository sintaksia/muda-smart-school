"use client";

import { Loader2 } from "lucide-react";
import { FormDialog } from "@/src/components/common/FormDialog";
import { Button } from "@/src/components/ui/button";
import { ENTITY_LABELS, promotionActionOptions } from "@/src/lib/constants";
import type { PromotionAction } from "@prisma/client";

interface PromotionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromAcademicYear: string;
  toAcademicYear: string;
  counts: Record<PromotionAction, number>;
  totalStudents: number;
  running: boolean;
  onConfirm: () => void;
}

export function PromotionConfirmDialog({
  open,
  onOpenChange,
  fromAcademicYear,
  toAcademicYear,
  counts,
  totalStudents,
  running,
  onConfirm,
}: PromotionConfirmDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Jalankan Kenaikan Kelas"
      description={`${totalStudents} ${ENTITY_LABELS.STUDENT.toLowerCase()} akan dipindahkan dari ${fromAcademicYear} ke ${toAcademicYear}. Siswa yang lulus dan keluar dilepas dari ${ENTITY_LABELS.CLASS.toLowerCase()}nya. Tahun ajaran aktif ikut berpindah ke ${toAcademicYear}.`}
    >
      <dl className="border-border divide-border divide-y rounded-sm border text-sm">
        {promotionActionOptions.map((option) => (
          <div
            key={option.value}
            className="flex items-center justify-between px-4 py-2"
          >
            <dt className="text-neutral-600">{option.label}</dt>
            <dd className="text-foreground font-semibold tabular-nums">
              {counts[option.value as PromotionAction]}
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-muted-foreground text-xs">
        Proses ini bisa dibatalkan selama belum ada jadwal, sesi atau absensi
        baru yang dibuat di tahun ajaran tujuan.
      </p>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={running}
          className="hover:bg-muted"
        >
          Batal
        </Button>
        <Button type="button" onClick={onConfirm} disabled={running}>
          {running && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {running ? "Memproses..." : "Ya, Jalankan"}
        </Button>
      </div>
    </FormDialog>
  );
}
