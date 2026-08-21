"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormDialog } from "@/src/components/common/FormDialog";
import { FormDialogActions } from "@/src/components/common/FormDialogActions";
import { apiRequest } from "@/src/lib/apiRequest";
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
      await apiRequest(
        isEdit ? `/api/master/students/${student?.id}` : "/api/master/students",
        isEdit ? "PATCH" : "POST",
        isEdit ? editable : { ...editable, email, password },
        `Gagal menyimpan ${ENTITY_LABELS.STUDENT.toLowerCase()}`,
      );
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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={
        isEdit
          ? `Edit ${ENTITY_LABELS.STUDENT}`
          : `Tambah ${ENTITY_LABELS.STUDENT}`
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <StudentFormSections
          register={register}
          control={control}
          errors={errors}
          classOptions={classOptions}
          isEdit={isEdit}
        />
        <FormDialogActions
          onCancel={() => onOpenChange(false)}
          submitting={submitting}
        />
      </form>
    </FormDialog>
  );
}
