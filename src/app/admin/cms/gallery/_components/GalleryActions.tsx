"use client";

import { CmsRowActions } from "@/src/app/admin/_components/CmsRowActions";
import type { Gallery } from "@/src/features/cms/services/gallery";

interface GalleryActionsProps {
  gallery: Gallery;
}

export function GalleryActions({ gallery }: GalleryActionsProps) {
  return (
    <CmsRowActions
      id={gallery.id}
      editHref={`/admin/cms/gallery/${gallery.id}`}
      apiPath="/api/cms/gallery"
      isActive={gallery.isActive}
      statusField="isActive"
      activateLabel="Aktifkan"
      deactivateLabel="Nonaktifkan"
      activatedMessage="Galeri diaktifkan"
      deactivatedMessage="Galeri dinonaktifkan"
      deleteSuccessMessage="Galeri berhasil dihapus"
      deleteErrorMessage="Gagal menghapus galeri"
      deleteDialogTitle="Hapus Galeri"
      deleteDialogDescription={`Apakah Anda yakin ingin menghapus galeri "${gallery.title}"?`}
    />
  );
}
