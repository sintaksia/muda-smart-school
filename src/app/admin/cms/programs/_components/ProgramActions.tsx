"use client";

import { CmsRowActions } from "@/src/app/admin/_components/CmsRowActions";
import type { ProgramWithRelations } from "@/src/features/cms/services/programs";

interface ProgramActionsProps {
  program: ProgramWithRelations;
}

export function ProgramActions({ program }: ProgramActionsProps) {
  return (
    <CmsRowActions
      id={program.id}
      editHref={`/admin/cms/programs/${program.id}`}
      apiPath="/api/cms/programs"
      isActive={program.isActive}
      statusField="isActive"
      activateLabel="Aktifkan"
      deactivateLabel="Nonaktifkan"
      activatedMessage="Program diaktifkan"
      deactivatedMessage="Program dinonaktifkan"
      deleteSuccessMessage="Program berhasil dihapus"
      deleteErrorMessage="Gagal menghapus program"
      deleteDialogTitle="Hapus Program"
      deleteDialogDescription={`Apakah Anda yakin ingin menghapus program "${program.name}"? Semua data terkait (kompetensi, karir, fasilitas) juga akan dihapus.`}
    />
  );
}
