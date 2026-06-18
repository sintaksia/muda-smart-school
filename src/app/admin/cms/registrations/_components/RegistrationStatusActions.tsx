"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, FileCheck } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

interface RegistrationStatusActionsProps {
  id: string;
  status: string;
}

export function RegistrationStatusActions({
  id,
  status,
}: RegistrationStatusActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (
    nextStatus: "DITERIMA" | "DITOLAK" | "DIVERIFIKASI",
    successMessage: string,
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/registrasi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.details || "Gagal memperbarui status",
        );
      }

      toast.success(result.message || successMessage);
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui status",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      <Button
        type="button"
        variant="default"
        disabled={isLoading}
        onClick={() => updateStatus("DITERIMA", "Pendaftaran diterima")}
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Terima Pendaftaran
      </Button>

      <Button
        type="button"
        variant="destructive"
        disabled={isLoading}
        onClick={() => updateStatus("DITOLAK", "Pendaftaran ditolak")}
      >
        <XCircle className="mr-2 h-4 w-4" />
        Tolak Pendaftaran
      </Button>

      {status === "PENDING" && (
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() =>
            updateStatus("DIVERIFIKASI", "Ditandai sebagai terverifikasi")
          }
        >
          <FileCheck className="mr-2 h-4 w-4" />
          Tandai Terverifikasi
        </Button>
      )}
    </div>
  );
}
