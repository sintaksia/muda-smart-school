"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, KeyRound, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { DeleteDialog } from "@/src/app/admin/_components/DeleteDialog";
import { ResetPasswordDialog } from "@/src/app/admin/_components/ResetPasswordDialog";
import { ENTITY_LABELS } from "@/src/lib/constants";
import type { StudentRow } from "@/src/features/master/types";

interface StudentActionsProps {
  student: StudentRow;
  onEdit: (student: StudentRow) => void;
}

export function StudentActions({ student, onEdit }: StudentActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  async function handleDelete(): Promise<void> {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/master/students/${student.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Gagal menghapus siswa");
      }
      toast.success(`${ENTITY_LABELS.STUDENT} berhasil dihapus`);
      setShowDelete(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus siswa",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/admin/siswa/${student.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(student)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowResetPassword(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={`Hapus ${ENTITY_LABELS.STUDENT}`}
        description={`Hapus "${student.name}" beserta akun loginnya? Tindakan ini tidak dapat dibatalkan. Siswa yang sudah memiliki riwayat absensi sebaiknya diubah statusnya, bukan dihapus.`}
      />

      <ResetPasswordDialog
        open={showResetPassword}
        onOpenChange={setShowResetPassword}
        userId={student.userId}
        userName={student.name}
      />
    </>
  );
}
