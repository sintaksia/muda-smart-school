"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, X, Plus, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { cn } from "@/src/lib/utils";

interface GalleryItem {
  id: string;
  title: string;
  image: string;
  category: string;
}

interface GalleryMultiPickerProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

export function GalleryMultiPicker({
  value,
  onChange,
  disabled,
}: GalleryMultiPickerProps) {
  const [open, setOpen] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchGallery();
    }
  }, [open]);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cms/gallery?active=true");
      if (!response.ok) throw new Error("Failed to fetch");
      const data: GalleryItem[] = await response.json();
      setGallery(data);
    } catch {
      setGallery([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (imageUrl: string) => {
    if (value.includes(imageUrl)) {
      onChange(value.filter((url) => url !== imageUrl));
    } else {
      onChange([...value, imageUrl]);
    }
  };

  const handleRemove = (imageUrl: string) => {
    onChange(value.filter((url) => url !== imageUrl));
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-sm overflow-hidden border group"
            >
              <Image
                src={url}
                alt={`Gambar ${index + 1}`}
                fill
                className="object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="absolute top-1 right-1 h-5 w-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!disabled && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {value.length === 0
                ? "Pilih Gambar dari Galeri"
                : "Tambah Gambar"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                Pilih Gambar dari Galeri
                {value.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({value.length} dipilih)
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : gallery.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mb-2" />
                  <p className="text-sm">Belum ada gambar di galeri.</p>
                  <p className="text-xs">
                    Tambah gambar di menu Galeri terlebih dahulu.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {gallery.map((item) => {
                    const isSelected = value.includes(item.image);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggle(item.image)}
                        className={cn(
                          "group relative aspect-square rounded-sm overflow-hidden border-2 transition-all hover:border-primary-500",
                          isSelected
                            ? "border-primary-500 ring-2 ring-primary-200"
                            : "border-transparent",
                        )}
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary-500/20 flex items-start justify-end p-1.5">
                            <div className="h-5 w-5 bg-primary-500 rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-xs text-white truncate">
                            {item.title}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
