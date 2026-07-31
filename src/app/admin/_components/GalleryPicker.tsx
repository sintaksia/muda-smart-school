"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, X, Images } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

interface GalleryItem {
  id: string;
  title: string;
  image: string;
  category: string;
}

interface GalleryPickerProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function GalleryPicker({
  value,
  onChange,
  disabled,
}: GalleryPickerProps) {
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

  const handleSelect = (imageUrl: string) => {
    onChange(imageUrl);
    setOpen(false);
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative h-48 rounded-md overflow-hidden border">
          <Image src={value} alt="Preview" fill className="object-cover" />
          {!disabled && (
            <div className="absolute top-2 right-2 flex gap-2">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Images className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <GalleryPickerDialog
                  gallery={gallery}
                  isLoading={isLoading}
                  selectedUrl={value}
                  onSelect={handleSelect}
                />
              </Dialog>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => onChange("")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div className="h-48 rounded-md border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-gray-50 cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Images className="h-10 w-10" />
              <p className="text-sm">Klik untuk pilih dari galeri</p>
            </div>
          </DialogTrigger>
          <GalleryPickerDialog
            gallery={gallery}
            isLoading={isLoading}
            selectedUrl={value}
            onSelect={handleSelect}
          />
        </Dialog>
      )}
    </div>
  );
}

interface GalleryPickerDialogProps {
  gallery: GalleryItem[];
  isLoading: boolean;
  selectedUrl?: string;
  onSelect: (url: string) => void;
}

function GalleryPickerDialog({
  gallery,
  isLoading,
  selectedUrl,
  onSelect,
}: GalleryPickerDialogProps) {
  return (
    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>Pilih Gambar dari Galeri</DialogTitle>
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
            {gallery.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.image)}
                className={`group relative aspect-square rounded-sm overflow-hidden border-2 transition-all hover:border-primary-500 ${
                  selectedUrl === item.image
                    ? "border-primary-500 ring-2 ring-primary-200"
                    : "border-transparent"
                }`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-xs text-white truncate">{item.title}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DialogContent>
  );
}
