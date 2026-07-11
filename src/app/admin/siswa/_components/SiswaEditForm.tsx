"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Form } from "@/src/components/ui/form";
import {
  updateSiswaCoreSchema,
  type UpdateSiswaCoreFormData,
} from "@/src/app/api/master/siswa/SiswaSchema";
import { SiswaAcademicFields, SiswaTextField } from "./SiswaFormFields";
import type { KelasOption } from "./types";

interface SiswaEditFormProps {
  siswaId: string;
  defaultValues: UpdateSiswaCoreFormData;
  kelasOptions: KelasOption[];
}

export function SiswaEditForm({
  siswaId,
  defaultValues,
  kelasOptions,
}: SiswaEditFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UpdateSiswaCoreFormData>({
    resolver: zodResolver(updateSiswaCoreSchema),
    defaultValues,
  });

  async function onSubmit(data: UpdateSiswaCoreFormData): Promise<void> {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/master/siswa/${siswaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await response.json();
      if (response.ok) {
        toast.success("Data siswa diperbarui");
        router.push(`/admin/siswa/${siswaId}`);
        router.refresh();
      } else {
        toast.error(body.error ?? "Gagal memperbarui siswa");
      }
    } catch {
      toast.error("Gagal memperbarui siswa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SiswaTextField
            control={form.control}
            name="name"
            label="Nama Lengkap"
          />
          <SiswaTextField
            control={form.control}
            name="phone"
            label="No. HP (opsional)"
          />
        </div>
        <SiswaAcademicFields
          control={form.control}
          kelasOptions={kelasOptions}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Form>
  );
}
