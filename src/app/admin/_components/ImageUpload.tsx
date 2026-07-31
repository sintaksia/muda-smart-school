"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { supabase } from "@/src/lib/supabase";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  bucket?: string;
  onChange: (url: string) => void;
  folder?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  bucket = "public-assets",
  folder = "uploads",
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      onChange(urlData.publicUrl);
      toast.success("Gambar berhasil diunggah");
    } catch {
      toast.error("Gagal mengunggah gambar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className="relative h-48 rounded-md overflow-hidden border">
          <Image src={value} alt="Preview" fill className="object-cover" />
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
          {!isUploading && !disabled && (
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
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
        <div
          onClick={() => !disabled && !isUploading && inputRef.current?.click()}
          className="h-48 rounded-md border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-gray-50 cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
          ) : (
            <>
              <ImageIcon className="h-10 w-10" />
              <p className="text-sm">Klik untuk upload gambar</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
