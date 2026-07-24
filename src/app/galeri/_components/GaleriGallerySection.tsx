"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { Gallery } from "@/src/features/cms/services/gallery";
import GaleriLightbox from "./GaleriLightbox";

type CategoryFilter =
  | "SEMUA"
  | "FACILITIES"
  | "ACTIVITIES"
  | "ACHIEVEMENTS"
  | "EXTRACURRICULAR"
  | "OTHER";

const categories: { value: CategoryFilter; label: string }[] = [
  { value: "SEMUA", label: "Semua" },
  { value: "FACILITIES", label: "Fasilitas" },
  { value: "ACTIVITIES", label: "Kegiatan" },
  { value: "ACHIEVEMENTS", label: "Prestasi" },
  { value: "EXTRACURRICULAR", label: "Ekskul" },
  { value: "OTHER", label: "Lainnya" },
];

const categoryLabels: Record<string, string> = {
  FACILITIES: "Fasilitas",
  ACTIVITIES: "Kegiatan",
  ACHIEVEMENTS: "Prestasi",
  EXTRACURRICULAR: "Ekskul",
  OTHER: "Lainnya",
};

interface GaleriGallerySectionProps {
  galleries: Gallery[];
}

function getGridClasses(index: number): {
  colSpan: string;
  rowSpan: string;
  aspect: string;
} {
  // Repeating 6-item bento pattern
  const pos = index % 6;
  switch (pos) {
    case 0:
      return {
        colSpan: "md:col-span-2",
        rowSpan: "md:row-span-2",
        aspect: "aspect-square",
      };
    case 1:
      return { colSpan: "md:col-span-1", rowSpan: "", aspect: "aspect-square" };
    case 2:
      return { colSpan: "md:col-span-1", rowSpan: "", aspect: "aspect-square" };
    case 3:
      return { colSpan: "md:col-span-1", rowSpan: "", aspect: "aspect-[4/3]" };
    case 4:
      return { colSpan: "md:col-span-1", rowSpan: "", aspect: "aspect-[4/3]" };
    case 5:
      return { colSpan: "md:col-span-2", rowSpan: "", aspect: "aspect-video" };
    default:
      return { colSpan: "md:col-span-1", rowSpan: "", aspect: "aspect-square" };
  }
}

export default function GaleriGallerySection({
  galleries,
}: GaleriGallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("SEMUA");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredGalleries = useMemo(() => {
    if (activeCategory === "SEMUA") return galleries;
    return galleries.filter((g) => g.category === activeCategory);
  }, [galleries, activeCategory]);

  return (
    <section className="py-16 md:py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.value
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredGalleries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <ImageOff className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Belum Ada Foto
            </h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Belum ada foto untuk kategori ini. Silakan cek kategori lainnya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {filteredGalleries.map((gallery, index) => {
              const { colSpan, rowSpan, aspect } = getGridClasses(index);

              return (
                <div key={gallery.id} className={`${colSpan} ${rowSpan}`}>
                  <button
                    onClick={() => setLightboxIndex(index)}
                    className={`relative w-full ${aspect} rounded-2xl overflow-hidden group cursor-pointer`}
                  >
                    <Image
                      src={gallery.image}
                      alt={gallery.title}
                      fill
                      sizes={
                        colSpan.includes("col-span-2")
                          ? "(max-width: 768px) 100vw, 50vw"
                          : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                      }
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Hover content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="inline-block w-fit px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-2">
                        {categoryLabels[gallery.category] ?? gallery.category}
                      </span>
                      <h3 className="text-white font-semibold text-sm leading-tight">
                        {gallery.title}
                      </h3>
                      {gallery.description && (
                        <p className="text-white/80 text-xs mt-1 line-clamp-2">
                          {gallery.description}
                        </p>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <GaleriLightbox
          galleries={filteredGalleries}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
