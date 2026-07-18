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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/src/components/ui/form";
import { Switch } from "@/src/components/ui/switch";
import { FormCard } from "@/src/app/admin/_components/FormCard";
import { GalleryMultiPicker } from "@/src/app/admin/_components/GalleryMultiPicker";
import { IconPicker } from "@/src/app/admin/_components/IconPicker";
import { useCmsFormSubmit } from "@/src/app/admin/_components/useCmsFormSubmit";
import { facilitySchema, type FacilityFormData } from "./FacilitySchema";

interface FacilityFormProps {
  defaultValues?: Partial<FacilityFormData>;
  facilityId?: string;
}

export function FacilityForm({ defaultValues, facilityId }: FacilityFormProps) {
  const router = useRouter();
  const {
    submit: onSubmit,
    isLoading,
    isEditing,
  } = useCmsFormSubmit<FacilityFormData>({
    apiPath: "/api/cms/facilities",
    id: facilityId,
    listPath: "/admin/cms/facilities",
    createdMessage: "Fasilitas berhasil dibuat",
    updatedMessage: "Fasilitas berhasil diperbarui",
    errorMessage: "Gagal menyimpan fasilitas",
  });

  const form = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema) as Resolver<FacilityFormData>,
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      images: [],
      order: 0,
      isActive: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormCard
          title="Informasi Fasilitas"
          description="Data utama fasilitas"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Fasilitas</FormLabel>
                    <FormControl>
                      <Input placeholder="Lab Komputer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi singkat fasilitas"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (Opsional)</FormLabel>
                    <FormControl>
                      <IconPicker
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
                      Fasilitas akan ditampilkan di halaman website.
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

        <FormCard
          title="Galeri Foto"
          description="Pilih satu atau lebih foto fasilitas dari galeri (opsional)"
        >
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <GalleryMultiPicker
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
