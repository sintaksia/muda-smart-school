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
  createSiswaSchema,
  type CreateSiswaFormData,
} from "@/src/app/api/master/siswa/SiswaSchema";
import { SiswaAcademicFields, SiswaTextField } from "./SiswaFormFields";
import type { KelasOption } from "./types";

interface SiswaCreateFormProps {
  kelasOptions: KelasOption[];
}

export function SiswaCreateForm({ kelasOptions }: SiswaCreateFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateSiswaFormData>({
    resolver: zodResolver(createSiswaSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      nis: "",
      nisn: "",
      angkatan: new Date().getFullYear(),
      status: "AKTIF",
    },
  });

  async function onSubmit(data: CreateSiswaFormData): Promise<void> {
    setSubmitting(true);
    try {
      const response = await fetch("/api/master/siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await response.json();
      if (response.ok) {
        toast.success("Akun siswa berhasil dibuat");
        router.push("/admin/siswa");
        router.refresh();
      } else {
        toast.error(body.error ?? "Gagal membuat akun siswa");
      }
    } catch {
      toast.error("Gagal membuat akun siswa");
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
            name="email"
            label="Email"
            type="email"
          />
          <SiswaTextField
            control={form.control}
            name="password"
            label="Password"
            type="password"
            placeholder="Minimal 8 karakter"
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
            Simpan
          </Button>
        </div>
      </form>
    </Form>
  );
}
