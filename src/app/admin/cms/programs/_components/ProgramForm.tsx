"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, UseFormReturn, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";
import { FormCard } from "@/src/app/admin/_components/FormCard";
import { GalleryPicker } from "@/src/app/admin/_components/GalleryPicker";
import { useCmsFormSubmit } from "@/src/app/admin/_components/useCmsFormSubmit";
import { programSchema, type ProgramFormData } from "./ProgramSchema";

interface ProgramFormProps {
  defaultValues?: Partial<ProgramFormData>;
  programId?: string;
}

export function ProgramForm({ defaultValues, programId }: ProgramFormProps) {
  const router = useRouter();
  const {
    submit: onSubmit,
    isLoading,
    isEditing,
  } = useCmsFormSubmit<ProgramFormData>({
    apiPath: "/api/cms/programs",
    id: programId,
    listPath: "/admin/cms/programs",
    createdMessage: "Program berhasil dibuat",
    updatedMessage: "Program berhasil diperbarui",
    errorMessage: "Gagal menyimpan program",
  });

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema) as Resolver<ProgramFormData>,
    defaultValues: {
      name: "",
      abbreviation: "",
      description: "",
      color: "#32368C",
      image: "",
      order: 0,
      isActive: true,
      skills: [],
      careers: [],
      facilities: [],
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informasi Dasar */}
        <FormCard
          title="Informasi Dasar"
          description="Data utama program keahlian"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Program</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pengembangan Perangkat Lunak dan Gim"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="abbreviation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Singkatan</FormLabel>
                  <FormControl>
                    <Input placeholder="PPLG" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warna</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="h-10 w-14 cursor-pointer p-1"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <Input
                        placeholder="#32368C"
                        {...field}
                        className="flex-1"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? 0
                            : parseInt(e.target.value, 10),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px]"
                        placeholder="Deskripsi program keahlian..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="md:col-span-2 flex flex-row items-center justify-between rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Status Aktif</FormLabel>
                    <FormDescription>
                      Program akan ditampilkan di halaman website.
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

        {/* Gambar Program */}
        <FormCard
          title="Gambar Program"
          description="Pilih gambar dari galeri (opsional)"
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

        {/* Kompetensi */}
        <ArrayFieldCard
          form={form}
          name="skills"
          title="Kompetensi"
          description="Daftar kompetensi yang dipelajari"
          placeholder="Contoh: Pemrograman Web"
        />

        {/* Prospek Karir */}
        <ArrayFieldCard
          form={form}
          name="careers"
          title="Prospek Karir"
          description="Daftar prospek karir lulusan"
          placeholder="Contoh: Web Developer"
        />

        {/* Fasilitas */}
        <ArrayFieldCard
          form={form}
          name="facilities"
          title="Fasilitas"
          description="Daftar fasilitas yang tersedia"
          placeholder="Contoh: Lab Komputer"
        />

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

// Komponen untuk field array (skills, careers, facilities)
interface ArrayFieldCardProps {
  form: UseFormReturn<ProgramFormData>;
  name: "skills" | "careers" | "facilities";
  title: string;
  description: string;
  placeholder: string;
}

function ArrayFieldCard({
  form,
  name,
  title,
  description,
  placeholder,
}: ArrayFieldCardProps) {
  const [newItem, setNewItem] = useState("");
  const items = form.watch(name) || [];

  const addItem = () => {
    if (newItem.trim()) {
      form.setValue(name, [...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = (index: number) => {
    form.setValue(
      name,
      items.filter((_, i) => i !== index),
    );
  };

  return (
    <FormCard title={title} description={description}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <Button type="button" onClick={addItem} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="ml-1 rounded-full p-0.5 hover:bg-primary-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Belum ada {title.toLowerCase()}. Ketik dan tekan Enter atau klik
            tombol + untuk menambah.
          </p>
        )}
      </div>
    </FormCard>
  );
}
