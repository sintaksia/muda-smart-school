"use client";

import { CmsRowActions } from "@/src/app/admin/_components/CmsRowActions";
import type { HeroSlide } from "@/src/features/cms/services/hero-slides";

interface HeroSlideActionsProps {
  heroSlide: HeroSlide;
}

export function HeroSlideActions({ heroSlide }: HeroSlideActionsProps) {
  return (
    <CmsRowActions
      id={heroSlide.id}
      editHref={`/admin/cms/hero-slides/${heroSlide.id}`}
      apiPath="/api/cms/hero-slides"
      isActive={heroSlide.isActive}
      statusField="isActive"
      activateLabel="Aktifkan"
      deactivateLabel="Nonaktifkan"
      activatedMessage="Hero slide diaktifkan"
      deactivatedMessage="Hero slide dinonaktifkan"
      deleteSuccessMessage="Hero slide berhasil dihapus"
      deleteErrorMessage="Gagal menghapus hero slide"
      deleteDialogTitle="Hapus Hero Slide"
      deleteDialogDescription={`Apakah Anda yakin ingin menghapus slide "${heroSlide.title}"?`}
    />
  );
}
