"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { ENTITY_LABELS } from "@/src/lib/constants";
import {
  createStudentSchema,
  type CreateStudentFormData,
} from "@/src/app/api/master/students/StudentSchema";
import { StudentFormSections } from "./StudentFormSections";
import type { StudentRow } from "@/src/features/master/types";

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null opens the dialog in "create" mode. */
  student: StudentRow | null;
  classOptions: { id: string; name: string }[];
}

function toDefaultValues(student: StudentRow | null): CreateStudentFormData {
  return {
    name: student?.name ?? "",
    avatar: student?.avatar ?? null,
    email: student?.email ?? "",
    password: "",
    phone: student?.phone ?? null,
    nis: student?.nis ?? "",
    nisn: student?.nisn ?? "",
    specialization: (student?.specialization ??
      "AUTOMOTIVE_ENGINEERING") as CreateStudentFormData["specialization"],
    angkatan: student?.angkatan ?? new Date().getFullYear(),
    classId: student?.classId ?? null,
    status: (student?.status ?? "ACTIVE") as CreateStudentFormData["status"],
    gender: student?.gender ?? null,
    nik: student?.nik ?? null,
    birthPlace: student?.birthPlace ?? null,
    birthDate: student?.birthDate ?? null,
    streetAddress: student?.streetAddress ?? null,
    village: student?.village ?? null,
    district: student?.district ?? null,
    city: student?.city ?? null,
    province: student?.province ?? null,
    fatherName: student?.fatherName ?? null,
    motherName: student?.motherName ?? null,
    guardianName: student?.guardianName ?? null,
    parentPhone: student?.parentPhone ?? null,
    previousSchoolName: student?.previousSchoolName ?? null,
  };
}

export function StudentForm({
  open,
  onOpenChange,
  student,
  classOptions,
}: StudentFormProps) {
  const router = useRouter();
  const isEdit = Boolean(student);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStudentFormData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: toDefaultValues(student),
  });

  async function onSubmit(values: CreateStudentFormData): Promise<void> {
    setSubmitting(true);
    try {
      // Email and password are account-creation only; editing them is done
      // from the user menu / reset-password action.
      const { email, password, ...editable } = values;
      const response = await fetch(
        isEdit ? `/api/master/students/${student?.id}` : "/api/master/students",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEdit ? editable : { ...editable, email, password },
          ),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal menyimpan siswa");
      }
      toast.success(
        isEdit
          ? `Data ${ENTITY_LABELS.STUDENT} diperbarui`
          : `${ENTITY_LABELS.STUDENT} berhasil ditambahkan`,
      );
      onOpenChange(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan server",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-lg sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? `Edit ${ENTITY_LABELS.STUDENT}`
              : `Tambah ${ENTITY_LABELS.STUDENT}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <StudentFormSections
            register={register}
            control={control}
            errors={errors}
            classOptions={classOptions}
            isEdit={isEdit}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
