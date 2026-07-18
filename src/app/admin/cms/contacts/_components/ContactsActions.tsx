"use client";

import { CmsRowActions } from "@/src/app/admin/_components/CmsRowActions";
import type { Contact } from "@/src/features/cms/services/contacts";

interface ContactActionsProps {
  contact: Contact;
}

export function ContactActions({ contact }: ContactActionsProps) {
  return (
    <CmsRowActions
      id={contact.id}
      editHref={`/admin/cms/contacts/${contact.id}`}
      apiPath="/api/cms/contacts"
      isActive={contact.isActive}
      statusField="isActive"
      activateLabel="Aktifkan"
      deactivateLabel="Nonaktifkan"
      activatedMessage="Kontak diaktifkan"
      deactivatedMessage="Kontak dinonaktifkan"
      deleteSuccessMessage="Kontak berhasil dihapus"
      deleteErrorMessage="Gagal menghapus kontak"
      deleteDialogTitle="Hapus Kontak"
      deleteDialogDescription={`Apakah Anda yakin ingin menghapus kontak "${contact.name}"?`}
    />
  );
}
