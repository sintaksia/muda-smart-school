"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { faqSchema, type FaqFormData } from "./FaqSchema";

interface FaqFormProps {
  defaultValues?: Partial<FaqFormData>;
  faqId?: string;
}

export function FaqForm({ defaultValues, faqId }: FaqFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!faqId;

  const form = useForm<FaqFormData>({
    resolver: zodResolver(faqSchema) as Resolver<FaqFormData>,
    defaultValues: {
      question: "",
      answer: "",
      order: 0,
      isActive: true,
      ...defaultValues,
    },
  });

  const onSubmit = async (data: FaqFormData) => {
    setIsLoading(true);
    try {
      const url = isEditing ? `/api/cms/faqs/${faqId}` : "/api/cms/faqs";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan FAQ");
      }

      toast.success(
        isEditing ? "FAQ berhasil diperbarui" : "FAQ berhasil dibuat",
      );
      router.push("/admin/cms/faqs");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan FAQ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormCard title="Informasi FAQ" description="Pertanyaan dan jawaban">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pertanyaan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bagaimana cara mendaftar?"
                        {...field}
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
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jawaban</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tuliskan jawaban dari pertanyaan"
                        rows={5}
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
                      FAQ akan ditampilkan di halaman website.
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
