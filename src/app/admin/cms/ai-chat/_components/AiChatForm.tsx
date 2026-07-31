"use client";

import { useState } from "react";
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
import { FormCard } from "@/src/app/admin/_components/FormCard";
import { toast } from "sonner";
import { aiChatSchema, type AiChatFormData } from "./AiChatSchema";

interface AiChatFormProps {
  defaultValues: AiChatFormData;
}

export function AiChatForm({ defaultValues }: AiChatFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AiChatFormData>({
    resolver: zodResolver(aiChatSchema) as Resolver<AiChatFormData>,
    defaultValues,
  });

  const suggestionsToText = (suggestions: string[]): string =>
    suggestions.join("\n");

  const textToSuggestions = (text: string): string[] =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

  const onSubmit = async (data: AiChatFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cms/ai-chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan pengaturan");
      }

      toast.success("Pengaturan AI Chat berhasil diperbarui");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan pengaturan AI Chat");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Status Widget */}
        <FormCard
          title="Status Widget"
          description="Aktifkan atau nonaktifkan chat widget di semua halaman publik"
        >
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Aktifkan AI Chat</FormLabel>
                  <FormDescription>
                    Jika dinonaktifkan, widget chat tidak akan tampil di website
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
        </FormCard>

        {/* Pesan Sambutan */}
        <FormCard
          title="Pesan Sambutan"
          description="Pesan pertama yang dilihat pengguna saat membuka chat"
        >
          <FormField
            control={form.control}
            name="welcomeMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pesan Sambutan</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Halo! Saya asisten virtual..."
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormCard>

        {/* Saran Pertanyaan Cepat */}
        <FormCard
          title="Pertanyaan Cepat"
          description="Tombol saran pertanyaan yang muncul saat chat baru dibuka"
        >
          <FormField
            control={form.control}
            name="suggestions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daftar Pertanyaan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Jurusan apa saja?&#10;Cara daftar?&#10;Ada beasiswa?"
                    rows={5}
                    disabled={isLoading}
                    value={suggestionsToText(field.value)}
                    onChange={(e) =>
                      field.onChange(textToSuggestions(e.target.value))
                    }
                  />
                </FormControl>
                <FormDescription>
                  Tulis satu pertanyaan per baris. Maksimal disarankan 3–5
                  pertanyaan.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormCard>

        {/* System Prompt */}
        <FormCard
          title="Konteks AI (System Prompt)"
          description="Informasi dan instruksi yang diberikan ke AI. Semakin lengkap, semakin akurat jawaban AI."
        >
          <FormField
            control={form.control}
            name="systemPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Kamu adalah asisten virtual resmi SMK..."
                    rows={20}
                    disabled={isLoading}
                    className="font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Gunakan format Markdown untuk menyusun informasi sekolah.
                  Perubahan langsung berlaku untuk percakapan berikutnya.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormCard>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
