"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface CreateButtonProps {
  label: string;
  /** Navigates to a dedicated create route (CMS pages). */
  href?: string;
  /** Opens a `FormDialog` instead (master-data and attendance pages). */
  onClick?: () => void;
  disabled?: boolean;
}

/** The single "Tambah …" affordance. Whichever prop is passed, creation always
 *  happens in a popup or on its own page — never inline. */
export function CreateButton({
  label,
  href,
  onClick,
  disabled = false,
}: CreateButtonProps) {
  if (href) {
    return (
      <Button asChild>
        <Link href={href}>
          <Plus className="mr-2 h-4 w-4" />
          {label}
        </Link>
      </Button>
    );
  }

  return (
    <Button onClick={onClick} disabled={disabled}>
      <Plus className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
