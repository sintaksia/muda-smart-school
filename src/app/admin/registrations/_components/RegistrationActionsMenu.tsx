"use client";

import {
  MoreHorizontal,
  Eye,
  Pencil,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import type {
  PendaftaranWithStudent,
  StatusPendaftaran,
} from "@/src/features/registration/services";

interface RegistrationActionsMenuProps {
  registration: PendaftaranWithStudent;
  onUpdateStatus: (
    status: StatusPendaftaran,
    successMessage: string,
    errorMessage: string,
  ) => void;
  onDelete: () => void;
  onCreateStudent: () => void;
}

export function RegistrationActionsMenu({
  registration,
  onUpdateStatus,
  onDelete,
  onCreateStudent,
}: RegistrationActionsMenuProps) {
  const router = useRouter();

  const canChangeStatus =
    registration.status === "PENDING" || registration.status === "DIVERIFIKASI";
  const canCreateStudent =
    registration.status === "DITERIMA" && !registration.student;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/admin/registrations/${registration.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Lihat Detail
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            router.push(`/admin/registrations/${registration.id}/edit`)
          }
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            window.open(
              `/api/admin/registrations/${registration.id}/print`,
              "_blank",
            )
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {canChangeStatus && (
          <>
            <DropdownMenuItem
              onClick={() =>
                onUpdateStatus(
                  "DITERIMA",
                  "Pendaftaran diterima",
                  "Gagal memvalidasi pendaftaran",
                )
              }
              className="text-green-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Terima
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onUpdateStatus(
                  "DITOLAK",
                  "Pendaftaran ditolak",
                  "Gagal menolak pendaftaran",
                )
              }
              className="text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Tolak
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {canCreateStudent && (
          <>
            <DropdownMenuItem onClick={onCreateStudent}>
              <UserPlus className="mr-2 h-4 w-4" />
              Buat Akun Siswa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {registration.status === "PENDING" && (
          <DropdownMenuItem
            onClick={() =>
              onUpdateStatus(
                "DIVERIFIKASI",
                "Ditandai sebagai terverifikasi",
                "Gagal menandai terverifikasi",
              )
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            Tandai Terverifikasi
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
