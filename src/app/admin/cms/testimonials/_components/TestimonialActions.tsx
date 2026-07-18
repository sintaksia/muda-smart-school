"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { DeleteDialog } from "@/src/app/admin/_components/DeleteDialog";
import { toast } from "sonner";
import type { Testimonial } from "@/src/features/cms/services/testimonials";

interface TestimonialActionsProps {
  testimonial: Testimonial;
}

export function TestimonialActions({ testimonial }: TestimonialActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cms/testimonials/${testimonial.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus testimoni");
      }

      toast.success("Testimoni berhasil dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus testimoni");
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await fetch(`/api/cms/testimonials/${testimonial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !testimonial.isActive }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengubah status");
      }

      toast.success(
        testimonial.isActive
          ? "Testimoni dinonaktifkan"
          : "Testimoni diaktifkan",
      );
      router.refresh();
    } catch {
      toast.error("Gagal mengubah status");
    }
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
          <DropdownMenuItem
            onClick={() =>
              router.push(`/admin/cms/testimonials/${testimonial.id}`)
            }
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {testimonial.isActive ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Nonaktifkan
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Aktifkan
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isLoading={isLoading}
        title="Hapus Testimoni"
        description={`Apakah Anda yakin ingin menghapus testimoni dari "${testimonial.name}"?`}
      />
    </>
  );
}
