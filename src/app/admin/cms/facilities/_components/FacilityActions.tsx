"use client";

import { CmsRowActions } from "@/src/app/admin/_components/CmsRowActions";
import type { Facility } from "@/src/features/cms/services/facilities";

interface FacilityActionsProps {
  facility: Facility;
}

export function FacilityActions({ facility }: FacilityActionsProps) {
  return (
    <CmsRowActions
      id={facility.id}
      editHref={`/admin/cms/facilities/${facility.id}`}
      apiPath="/api/cms/facilities"
      isActive={facility.isActive}
      statusField="isActive"
      activateLabel="Aktifkan"
      deactivateLabel="Nonaktifkan"
      activatedMessage="Fasilitas diaktifkan"
      deactivatedMessage="Fasilitas dinonaktifkan"
      deleteSuccessMessage="Fasilitas berhasil dihapus"
      deleteErrorMessage="Gagal menghapus fasilitas"
      deleteDialogTitle="Hapus Fasilitas"
      deleteDialogDescription={`Apakah Anda yakin ingin menghapus fasilitas "${facility.name}"?`}
    />
  );
}
