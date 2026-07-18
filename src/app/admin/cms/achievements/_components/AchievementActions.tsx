"use client";

import { CmsRowActions } from "@/src/app/admin/_components/CmsRowActions";
import type { Achievement } from "@/src/features/cms/services/achievements";

interface AchievementActionsProps {
  achievement: Achievement;
}

export function AchievementActions({ achievement }: AchievementActionsProps) {
  return (
    <CmsRowActions
      id={achievement.id}
      editHref={`/admin/cms/achievements/${achievement.id}`}
      apiPath="/api/cms/achievements"
      isActive={achievement.isActive}
      statusField="isActive"
      activateLabel="Aktifkan"
      deactivateLabel="Nonaktifkan"
      activatedMessage="Prestasi diaktifkan"
      deactivatedMessage="Prestasi dinonaktifkan"
      deleteSuccessMessage="Prestasi berhasil dihapus"
      deleteErrorMessage="Gagal menghapus prestasi"
      deleteDialogTitle="Hapus Prestasi"
      deleteDialogDescription={`Apakah Anda yakin ingin menghapus prestasi "${achievement.title}"?`}
    />
  );
}
