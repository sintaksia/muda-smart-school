"use client";

import { CmsRowActions } from "@/src/app/admin/_components/CmsRowActions";
import type { Faq } from "@/src/features/cms/services/faqs";

interface FaqActionsProps {
  faq: Faq;
}

export function FaqActions({ faq }: FaqActionsProps) {
  return (
    <CmsRowActions
      id={faq.id}
      editHref={`/admin/cms/faqs/${faq.id}`}
      apiPath="/api/cms/faqs"
      isActive={faq.isActive}
      statusField="isActive"
      activateLabel="Aktifkan"
      deactivateLabel="Nonaktifkan"
      activatedMessage="FAQ diaktifkan"
      deactivatedMessage="FAQ dinonaktifkan"
      deleteSuccessMessage="FAQ berhasil dihapus"
      deleteErrorMessage="Gagal menghapus FAQ"
      deleteDialogTitle="Hapus FAQ"
      deleteDialogDescription={`Apakah Anda yakin ingin menghapus FAQ "${faq.question}"?`}
    />
  );
}
