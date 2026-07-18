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

export interface CmsRowActionsProps {
  id: string;
  editHref: string;
  apiPath: string;
  isActive: boolean;
  statusField: string;
  activateLabel: string;
  deactivateLabel: string;
  activatedMessage: string;
  deactivatedMessage: string;
  deleteSuccessMessage: string;
  deleteErrorMessage: string;
  deleteDialogTitle: string;
  deleteDialogDescription: string;
}

/**
 * Shared row-actions dropdown (edit / toggle status / delete) for CMS list
 * tables. Every CMS feature's `[Feature]Actions.tsx` wraps this with its
 * own labels/messages instead of re-implementing the same menu + dialog.
 */
export function CmsRowActions({
  id,
  editHref,
  apiPath,
  isActive,
  statusField,
  activateLabel,
  deactivateLabel,
  activatedMessage,
  deactivatedMessage,
  deleteSuccessMessage,
  deleteErrorMessage,
  deleteDialogTitle,
  deleteDialogDescription,
}: CmsRowActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiPath}/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error(deleteErrorMessage);
      }

      toast.success(deleteSuccessMessage);
      router.refresh();
    } catch {
      toast.error(deleteErrorMessage);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await fetch(`${apiPath}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [statusField]: !isActive }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengubah status");
      }

      toast.success(isActive ? deactivatedMessage : activatedMessage);
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
          <DropdownMenuItem onClick={() => router.push(editHref)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {isActive ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                {deactivateLabel}
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                {activateLabel}
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
        title={deleteDialogTitle}
        description={deleteDialogDescription}
      />
    </>
  );
}
