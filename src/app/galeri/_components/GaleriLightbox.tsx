"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Gallery } from "@/src/features/cms/services/gallery";

const categoryLabels: Record<string, string> = {
  FACILITIES: "Fasilitas",
  ACTIVITIES: "Kegiatan",
  ACHIEVEMENTS: "Prestasi",
  EXTRACURRICULAR: "Ekskul",
  OTHER: "Lainnya",
};

interface GaleriLightboxProps {
  galleries: Gallery[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function GaleriLightbox({
  galleries,
  currentIndex,
  onClose,
  onNavigate,
}: GaleriLightboxProps) {
  const gallery = galleries[currentIndex];

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < galleries.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, galleries.length, onNavigate]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, handlePrev, handleNext]);

  if (!gallery) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Tutup"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 text-white/70 text-sm font-medium">
        {currentIndex + 1} / {galleries.length}
      </div>

      {/* Navigation - Previous */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Foto sebelumnya"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Navigation - Next */}
      {currentIndex < galleries.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Foto selanjutnya"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-5xl w-full mx-4 animate-in zoom-in-95 fade-in duration-200">
        {/* Image */}
        <div className="relative w-full aspect-[4/3] max-h-[70vh] rounded-2xl overflow-hidden">
          <Image
            src={gallery.image}
            alt={gallery.title}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-contain"
            priority
          />
        </div>

        {/* Info */}
        <div className="mt-4 text-center max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-medium mb-2">
            {categoryLabels[gallery.category] ?? gallery.category}
          </span>
          <h3 className="text-xl font-semibold text-white">{gallery.title}</h3>
          {gallery.description && (
            <p className="text-gray-400 text-sm mt-1">{gallery.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
