"use client";

import { CmsRowActions } from "@/src/app/admin/_components/CmsRowActions";
import type { Testimonial } from "@/src/features/cms/services/testimonials";

interface TestimonialActionsProps {
  testimonial: Testimonial;
}

export function TestimonialActions({ testimonial }: TestimonialActionsProps) {
  return (
    <CmsRowActions
      id={testimonial.id}
      editHref={`/admin/cms/testimonials/${testimonial.id}`}
      apiPath="/api/cms/testimonials"
      isActive={testimonial.isActive}
      statusField="isActive"
      activateLabel="Aktifkan"
      deactivateLabel="Nonaktifkan"
      activatedMessage="Testimoni diaktifkan"
      deactivatedMessage="Testimoni dinonaktifkan"
      deleteSuccessMessage="Testimoni berhasil dihapus"
      deleteErrorMessage="Gagal menghapus testimoni"
      deleteDialogTitle="Hapus Testimoni"
      deleteDialogDescription={`Apakah Anda yakin ingin menghapus testimoni dari "${testimonial.name}"?`}
    />
  );
}
