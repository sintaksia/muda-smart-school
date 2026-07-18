"use client";

import { CmsRowActions } from "@/src/app/admin/_components/CmsRowActions";
import type { Extracurricular } from "@/src/features/cms/services/extracurriculars";

interface ExtracurricularActionsProps {
  extracurricular: Extracurricular;
}

export function ExtracurricularActions({
  extracurricular,
}: ExtracurricularActionsProps) {
  return (
    <CmsRowActions
      id={extracurricular.id}
      editHref={`/admin/cms/extracurriculars/${extracurricular.id}`}
      apiPath="/api/cms/extracurriculars"
      isActive={extracurricular.isActive}
      statusField="isActive"
      activateLabel="Aktifkan"
      deactivateLabel="Nonaktifkan"
      activatedMessage="Ekstrakurikuler diaktifkan"
      deactivatedMessage="Ekstrakurikuler dinonaktifkan"
      deleteSuccessMessage="Ekstrakurikuler berhasil dihapus"
      deleteErrorMessage="Gagal menghapus ekstrakurikuler"
      deleteDialogTitle="Hapus Ekstrakurikuler"
      deleteDialogDescription={`Apakah Anda yakin ingin menghapus ekstrakurikuler "${extracurricular.name}"?`}
    />
  );
}
