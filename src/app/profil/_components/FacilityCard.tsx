"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { cn } from "@/src/lib/utils";
import { ICON_MAP } from "@/src/lib/icons";

interface FacilityCardProps {
  facility: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    images: string[];
  };
}

export function FacilityCard({ facility }: FacilityCardProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const images = facility.images ?? [];
  const hasDetail = images.length > 0 || !!facility.description;
  const Icon =
    facility.icon && ICON_MAP[facility.icon]
      ? ICON_MAP[facility.icon]
      : Building2;

  const prev = () =>
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  return (
    <>
      <div
        onClick={() => hasDetail && setOpen(true)}
        className={cn(
          "bg-gradient-to-br from-green-50 to-green-100/50 rounded-md border border-green-200 hover:border-green-400 hover:shadow-sm transition-all duration-300 group overflow-hidden",
          hasDetail && "cursor-pointer",
        )}
      >
        {/* Image strip */}
        {images.length > 0 && (
          <div className="flex h-28 overflow-hidden">
            {images.slice(0, 3).map((img, idx) => (
              <div
                key={idx}
                className="relative flex-1 overflow-hidden"
                style={{
                  flexBasis: `${100 / Math.min(images.length, 3)}%`,
                }}
              >
                <Image
                  src={img}
                  alt={`${facility.name} ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 33vw, 15vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {idx === 2 && images.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      +{images.length - 3}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Card content */}
        <div className="p-5">
          <div className="w-10 h-10 bg-green-500 rounded-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-neutral-800">{facility.name}</h3>
          {facility.description && (
            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
              {facility.description}
            </p>
          )}
          {hasDetail && (
            <p className="text-xs text-green-600 mt-2 font-medium">
              Lihat detail →
            </p>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {hasDetail && (
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setActiveIndex(0);
          }}
        >
          <DialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0">
            {/* Main image */}
            {images.length > 0 && (
              <div className="relative aspect-video bg-neutral-900">
                <Image
                  src={images[activeIndex]}
                  alt={`${facility.name} ${activeIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {activeIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-1.5 px-4 pt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      "relative flex-shrink-0 h-12 w-12 rounded overflow-hidden border-2 transition-all",
                      idx === activeIndex
                        ? "border-green-500"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="px-4 py-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-green-500 rounded-md flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  {facility.name}
                </DialogTitle>
              </DialogHeader>
              {facility.description && (
                <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                  {facility.description}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
