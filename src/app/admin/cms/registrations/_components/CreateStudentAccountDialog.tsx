"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
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
import type { PendaftaranWithStudent } from "@/src/features/registration/services";

interface CreateStudentAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: PendaftaranWithStudent;
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
      pendaftaranId: registration.id,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Akun Siswa</DialogTitle>
          <DialogDescription>
            Buat akun login untuk <strong>{registration.namaLengkap}</strong> (
            {registration.emailMurid || "tidak ada email"})
          </DialogDescription>
        </DialogHeader>

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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Buat Akun"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
