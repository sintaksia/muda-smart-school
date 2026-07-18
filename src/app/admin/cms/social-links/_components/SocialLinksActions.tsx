"use client";

import { CmsRowActions } from "@/src/app/admin/_components/CmsRowActions";
import type { SocialLink } from "@/src/features/cms/services/social-links";

interface SocialLinkActionsProps {
  socialLink: SocialLink;
}

export function SocialLinkActions({ socialLink }: SocialLinkActionsProps) {
  return (
    <CmsRowActions
      id={socialLink.id}
      editHref={`/admin/cms/social-links/${socialLink.id}`}
      apiPath="/api/cms/social-links"
      isActive={socialLink.isActive}
      statusField="isActive"
      activateLabel="Aktifkan"
      deactivateLabel="Nonaktifkan"
      activatedMessage="Tautan diaktifkan"
      deactivatedMessage="Tautan dinonaktifkan"
      deleteSuccessMessage="Tautan sosial berhasil dihapus"
      deleteErrorMessage="Gagal menghapus tautan sosial"
      deleteDialogTitle="Hapus Tautan Sosial"
      deleteDialogDescription={`Apakah Anda yakin ingin menghapus tautan "${socialLink.platform}"?`}
    />
  );
}
