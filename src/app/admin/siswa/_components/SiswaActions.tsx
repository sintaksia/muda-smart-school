"use client";

import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { SiswaRow } from "./types";

interface SiswaActionsProps {
  siswa: SiswaRow;
}

export function SiswaActions({ siswa }: SiswaActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/siswa/${siswa.id}`} title="Detail">
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/siswa/${siswa.id}/edit`} title="Edit">
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
