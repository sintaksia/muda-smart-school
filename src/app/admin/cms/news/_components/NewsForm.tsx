"use client";

import { useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch } from "@/src/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { FormCard } from "@/src/app/admin/_components/FormCard";
import { GalleryPicker } from "@/src/app/admin/_components/GalleryPicker";
import { TiptapEditor } from "@/src/app/admin/_components/TiptapEditor";
import { useCmsFormSubmit } from "@/src/app/admin/_components/useCmsFormSubmit";
import { newsSchema, type NewsFormData } from "./NewsSchema";
import { generateSlug } from "@/src/features/cms/utils/slug";

interface NewsFormProps {
  defaultValues?: Partial<NewsFormData>;
  newsId?: string;
}

export function NewsForm({ defaultValues, newsId }: NewsFormProps) {
  const router = useRouter();
  const {
    submit: onSubmit,
    isLoading,
    isEditing,
  } = useCmsFormSubmit<NewsFormData>({
    apiPath: "/api/cms/news",
    id: newsId,
    listPath: "/admin/cms/news",
    createdMessage: "Berita berhasil dibuat",
    updatedMessage: "Berita berhasil diperbarui",
    errorMessage: "Gagal menyimpan berita",
  });

  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema) as Resolver<NewsFormData>,
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      image: "",
      category: "BERITA",
      isFeatured: false,
      isPublished: false,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informasi Dasar */}
        <FormCard title="Informasi Dasar" description="Data utama berita">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Judul berita..."
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!isEditing) {
                          form.setValue("slug", generateSlug(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="slug-berita" {...field} />
                  </FormControl>
                  <FormDescription>
                    Dibuat otomatis dari judul. Hanya huruf kecil, angka, dan
                    tanda hubung.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Kategori</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BERITA">Berita</SelectItem>
                      <SelectItem value="PENGUMUMAN">Pengumuman</SelectItem>
                      <SelectItem value="KEGIATAN">Kegiatan</SelectItem>
                      <SelectItem value="PRESTASI">Prestasi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormCard>

        {/* Konten */}
        <FormCard title="Konten" description="Isi berita">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konten</FormLabel>
                <FormControl>
                  <TiptapEditor
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormCard>

        {/* Ringkasan & Gambar */}
        <FormCard
          title="Ringkasan & Gambar"
          description="Ringkasan dan gambar berita"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ringkasan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ringkasan singkat berita..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ditampilkan sebagai preview di halaman daftar berita.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gambar (Opsional)</FormLabel>
                  <FormControl>
                    <GalleryPicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormCard>

        {/* Pengaturan */}
        <FormCard
          title="Pengaturan"
          description="Atur visibilitas dan status berita"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Berita Unggulan</FormLabel>
                    <FormDescription>
                      Tampilkan berita ini di bagian unggulan halaman utama.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Publikasikan</FormLabel>
                    <FormDescription>
                      Berita akan terlihat oleh publik saat diaktifkan.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </FormCard>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : isEditing ? "Perbarui" : "Simpan"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
}
