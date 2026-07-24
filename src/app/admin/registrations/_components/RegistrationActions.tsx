"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteDialog } from "@/src/app/admin/_components/DeleteDialog";
import { CreateStudentAccountDialog } from "./CreateStudentAccountDialog";
import { RegistrationActionsMenu } from "./RegistrationActionsMenu";
import type {
  RegistrationWithStudent,
  RegistrationStatus,
} from "@/src/features/registration/services";

interface RegistrationActionsProps {
  registration: RegistrationWithStudent;
}

export function RegistrationActions({
  registration,
}: RegistrationActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateStudentDialog, setShowCreateStudentDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (
    status: RegistrationStatus,
    successMessage: string,
    errorMessage: string,
  ) => {
    try {
      const response = await fetch(`/api/registrasi/${registration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || errorMessage);
      }

      toast.success(successMessage);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : errorMessage);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/registrasi/${registration.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Gagal menghapus");

      toast.success("Pendaftaran berhasil dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus pendaftaran");
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <RegistrationActionsMenu
        registration={registration}
        onUpdateStatus={updateStatus}
        onDelete={() => setShowDeleteDialog(true)}
        onCreateStudent={() => setShowCreateStudentDialog(true)}
      />

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isLoading={isLoading}
        title="Hapus Pendaftaran"
        description={`Apakah Anda yakin ingin menghapus pendaftaran "${registration.fullName}"?`}
      />

      <CreateStudentAccountDialog
        open={showCreateStudentDialog}
        onOpenChange={setShowCreateStudentDialog}
        registration={registration}
      />
    </>
  );
}
