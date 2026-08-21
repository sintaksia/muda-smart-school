"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { FormDialog } from "@/src/components/common/FormDialog";
import { FormDialogActions } from "@/src/components/common/FormDialogActions";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  createStudentFromRegistrationSchema,
  type CreateStudentFromRegistrationFormData,
} from "@/src/app/api/students/StudentSchema";
import { ENTITY_LABELS } from "@/src/lib/constants";
import type { RegistrationWithStudent } from "@/src/features/registration/services";

interface CreateStudentAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: RegistrationWithStudent;
}

export function CreateStudentAccountDialog({
  open,
  onOpenChange,
  registration,
}: CreateStudentAccountDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CreateStudentFromRegistrationFormData>({
    resolver: zodResolver(createStudentFromRegistrationSchema),
    defaultValues: {
      registrationId: registration.id,
      nis: "",
      angkatan: new Date().getFullYear(),
      password: "",
    },
  });

  async function onSubmit(data: CreateStudentFromRegistrationFormData) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal membuat akun siswa");
      }

      toast.success("Akun siswa berhasil dibuat");
      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat akun siswa",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Buat Akun ${ENTITY_LABELS.STUDENT}`}
      description={
        <>
          Buat akun login untuk <strong>{registration.fullName}</strong> (
          {registration.studentEmail || "tidak ada email"})
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIS</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nomor Induk Siswa"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="angkatan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Angkatan</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Tahun masuk"
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Minimal 8 karakter"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormDialogActions
            onCancel={() => onOpenChange(false)}
            submitting={isLoading}
            submitLabel="Buat Akun"
          />
        </form>
      </Form>
    </FormDialog>
  );
}
