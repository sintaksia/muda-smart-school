"use client";

import { useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Switch } from "@/src/components/ui/switch";
import { FormCard } from "@/src/app/admin/_components/FormCard";
import { GalleryPicker } from "@/src/app/admin/_components/GalleryPicker";
import { useCmsFormSubmit } from "@/src/app/admin/_components/useCmsFormSubmit";
import { heroSlideSchema, type HeroSlideFormData } from "./HeroSlideSchema";

interface HeroSlideFormProps {
  defaultValues?: Partial<HeroSlideFormData>;
  heroSlideId?: string;
}

export function HeroSlideForm({
  defaultValues,
  heroSlideId,
}: HeroSlideFormProps) {
  const router = useRouter();
  const {
    submit: onSubmit,
    isLoading,
    isEditing,
  } = useCmsFormSubmit<HeroSlideFormData>({
    apiPath: "/api/cms/hero-slides",
    id: heroSlideId,
    listPath: "/admin/cms/hero-slides",
    createdMessage: "Hero slide berhasil dibuat",
    updatedMessage: "Hero slide berhasil diperbarui",
    errorMessage: "Gagal menyimpan hero slide",
  });

  const form = useForm<HeroSlideFormData>({
    resolver: zodResolver(heroSlideSchema) as Resolver<HeroSlideFormData>,
    defaultValues: {
      title: "",
      subtitle: null,
      image: "",
      ctaText: null,
      ctaLink: null,
      order: 0,
      isActive: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informasi Slide */}
        <FormCard title="Informasi Slide" description="Data utama hero slide">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul</FormLabel>
                    <FormControl>
                      <Input placeholder="Judul slide" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Subtitle slide"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urutan</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="md:col-span-2 flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Status Aktif</FormLabel>
                    <FormDescription>
                      Slide akan ditampilkan pada hero di halaman utama.
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

        {/* Gambar Slide */}
        <FormCard
          title="Gambar Slide"
          description="Pilih gambar hero slide dari galeri (wajib)"
        >
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
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
        </FormCard>

        {/* CTA (Call to Action) */}
        <FormCard
          title="Call to Action (Opsional)"
          description="Tombol aksi yang ditampilkan pada slide"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="ctaText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teks Tombol</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Daftar Sekarang"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ctaLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Tombol</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: /registrasi"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
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
