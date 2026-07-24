"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  registrasiSchema,
  type RegistrasiFormData,
} from "@/src/features/registration/services/registration.schema";
import { registrationToFormDefaults } from "@/src/features/registration/services/registration.utils";
import type { Registration } from "@prisma/client";

import { Button } from "@/src/components/ui/button";
import { Form } from "@/src/components/ui/form";
import { IdentitasDiriFields } from "./edit-form/IdentitasDiriFields";
import { AlamatFields } from "./edit-form/AlamatFields";
import { OrangTuaFields } from "./edit-form/OrangTuaFields";
import { AsalSekolahFields } from "./edit-form/AsalSekolahFields";
import { TextFormField } from "./edit-form/FormFields";

interface RegistrationEditFormProps {
  registration: Registration;
}

export function RegistrationEditForm({
  registration,
}: RegistrationEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistrasiFormData>({
    resolver: zodResolver(registrasiSchema),
    mode: "onChange",
    defaultValues: registrationToFormDefaults(registration),
  });

  async function onSubmit(data: RegistrasiFormData) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/registrasi/${registration.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Gagal memperbarui data pendaftaran");
        return;
      }

      toast.success("Data pendaftaran berhasil diperbarui");
      router.push(`/admin/registrations/${registration.id}`);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <IdentitasDiriFields control={form.control} />
        <AlamatFields control={form.control} />
        <OrangTuaFields
          control={form.control}
          title="Data Ayah"
          subjek="Ayah"
          names={{
            nama: "fatherName",
            tahunLahir: "fatherBirthYear",
            pendidikan: "fatherEducation",
            pekerjaan: "fatherOccupation",
            noTelp: "fatherPhone",
          }}
        />
        <OrangTuaFields
          control={form.control}
          title="Data Ibu"
          subjek="Ibu"
          names={{
            nama: "motherName",
            tahunLahir: "motherBirthYear",
            pendidikan: "motherEducation",
            pekerjaan: "motherOccupation",
            noTelp: "motherPhone",
          }}
        />
        <OrangTuaFields
          control={form.control}
          title="Data Wali (Opsional)"
          subjek="Wali"
          names={{
            nama: "guardianName",
            tahunLahir: "guardianBirthYear",
            pendidikan: "guardianEducation",
            pekerjaan: "guardianOccupation",
            noTelp: "guardianPhone",
          }}
          pendidikanPlaceholder="Pilih pendidikan (opsional)"
        >
          <TextFormField
            control={form.control}
            name="guardianRelationship"
            label="Hubungan dengan Siswa"
          />
        </OrangTuaFields>
        <AsalSekolahFields control={form.control} />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(`/admin/registrations/${registration.id}`)
            }
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-900 hover:bg-primary-800 text-white px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
