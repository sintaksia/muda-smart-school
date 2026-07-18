"use client";

import { useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
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
import { useCmsFormSubmit } from "@/src/app/admin/_components/useCmsFormSubmit";
import {
  socialLinkSchema,
  socialPlatforms,
  type SocialLinkFormData,
} from "./SocialLinksSchema";

interface SocialLinkFormProps {
  defaultValues?: Partial<SocialLinkFormData>;
  socialLinkId?: string;
}

export function SocialLinksForm({
  defaultValues,
  socialLinkId,
}: SocialLinkFormProps) {
  const router = useRouter();
  const {
    submit: onSubmit,
    isLoading,
    isEditing,
  } = useCmsFormSubmit<SocialLinkFormData>({
    apiPath: "/api/cms/social-links",
    id: socialLinkId,
    listPath: "/admin/cms/social-links",
    createdMessage: "Tautan sosial berhasil dibuat",
    updatedMessage: "Tautan sosial berhasil diperbarui",
    errorMessage: "Gagal menyimpan tautan sosial",
  });

  const form = useForm<SocialLinkFormData>({
    resolver: zodResolver(socialLinkSchema) as Resolver<SocialLinkFormData>,
    defaultValues: {
      platform: "INSTAGRAM",
      url: "",
      username: "",
      order: 0,
      isActive: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormCard
          title="Informasi Sosial Media"
          description="Data tautan sosial media sekolah"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value || "INSTAGRAM"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {socialPlatforms.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="@smkmuda2cibiru" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://instagram.com/smkmuda2cibiru"
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
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urutan</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
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
                      Tautan akan ditampilkan di halaman website.
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
