"use client";

import { CmsRowActions } from "@/src/app/admin/_components/CmsRowActions";
import type { News } from "@prisma/client";

interface NewsActionsProps {
  news: News;
}

export function NewsActions({ news }: NewsActionsProps) {
  return (
    <CmsRowActions
      id={news.id}
      editHref={`/admin/cms/news/${news.id}`}
      apiPath="/api/cms/news"
      isActive={news.isPublished}
      statusField="isPublished"
      activateLabel="Publikasikan"
      deactivateLabel="Sembunyikan"
      activatedMessage="Berita dipublikasikan"
      deactivatedMessage="Berita disembunyikan"
      deleteSuccessMessage="Berita berhasil dihapus"
      deleteErrorMessage="Gagal menghapus berita"
      deleteDialogTitle="Hapus Berita"
      deleteDialogDescription={`Apakah Anda yakin ingin menghapus berita "${news.title}"? Tindakan ini tidak dapat dibatalkan.`}
    />
  );
}
