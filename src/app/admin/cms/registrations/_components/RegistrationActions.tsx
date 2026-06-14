"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { DeleteDialog } from "@/src/app/admin/_components/DeleteDialog";
import { CreateStudentAccountDialog } from "./CreateStudentAccountDialog";
import { toast } from "sonner";
import type { PendaftaranWithStudent } from "@/src/features/registration/services";

interface RegistrationActionsProps {
  registration: PendaftaranWithStudent;
}

export function RegistrationActions({
  registration,
}: RegistrationActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateStudentDialog, setShowCreateStudentDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Action: View Details
  const handleViewDetails = () => {
    router.push(`/admin/cms/registrations/${registration.id}`);
  };

  // Action: Validate (accept)
  const handleValidate = async () => {
    try {
      console.log("🔄 Validating registration:", registration.id);

      const response = await fetch(`/api/registrasi/${registration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DITERIMA", // Sesuai dengan enum di Prisma
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ API Error:", result);
        throw new Error(result.error || result.details || "Gagal validasi");
      }

      console.log("✅ Success:", result);
      toast.success(result.message || "Pendaftaran diterima");

      // Refresh data
      router.refresh();
    } catch (error: unknown) {
      console.error("❌ Validation error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memvalidasi pendaftaran",
      );
    }
  };

  // Action: Reject
  const handleReject = async () => {
    try {
      console.log("🔄 Rejecting registration:", registration.id);

      const response = await fetch(`/api/registrasi/${registration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DITOLAK", // Sesuai dengan enum di Prisma
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ API Error:", result);
        throw new Error(result.error || result.details || "Gagal menolak");
      }

      console.log("✅ Success:", result);
      toast.success(result.message || "Pendaftaran ditolak");

      // Refresh data
      router.refresh();
    } catch (error: unknown) {
      console.error("❌ Rejection error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menolak pendaftaran",
      );
    }
  };

  // Action: Delete
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

  const handleDownload = () => {
    window.open(`/api/admin/registrations/${registration.id}/print`, "_blank");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* View Details */}
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat Detail
          </DropdownMenuItem>

          {/* Download */}
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Status Actions - hanya untuk PENDING */}
          {registration.status === "PENDING" && (
            <>
              <DropdownMenuItem
                onClick={handleValidate}
                className="text-green-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Terima
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReject} className="text-red-600">
                <XCircle className="mr-2 h-4 w-4" />
                Tolak
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Buat Akun Siswa - untuk yang sudah diterima dan belum punya akun */}
          {registration.status === "DITERIMA" && !registration.student && (
            <>
              <DropdownMenuItem
                onClick={() => setShowCreateStudentDialog(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Buat Akun Siswa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Mark as Verified - untuk yang belum diverifikasi */}
          {registration.status === "PENDING" && (
            <DropdownMenuItem
              onClick={() => {
                // Action untuk tandai sebagai terverifikasi
                fetch(`/api/registrasi/${registration.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "DIVERIFIKASI" }),
                }).then(() => {
                  toast.success("Ditandai sebagai terverifikasi");
                  router.refresh();
                });
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Tandai Terverifikasi
            </DropdownMenuItem>
          )}

          {/* Delete */}
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isLoading={isLoading}
        title="Hapus Pendaftaran"
        description={`Apakah Anda yakin ingin menghapus pendaftaran "${registration.namaLengkap}"?`}
      />

      {/* Create Student Account Dialog */}
      <CreateStudentAccountDialog
        open={showCreateStudentDialog}
        onOpenChange={setShowCreateStudentDialog}
        registration={registration}
      />
    </>
  );
}
