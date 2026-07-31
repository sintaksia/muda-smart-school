"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/app/admin/_components/Badge";
import { SortableHeader } from "@/src/app/admin/_components/SortableHeader";
import { indexColumn } from "@/src/app/admin/_components/indexColumn";
import {
  ENTITY_LABELS,
  SPECIALIZATION_SHORT_LABELS,
  STUDENT_STATUS_BADGES,
  STUDENT_STATUS_LABELS,
} from "@/src/lib/constants";
import { StudentActions } from "./StudentActions";
import type { StudentRow } from "@/src/features/master/types";

interface StudentColumnsOptions {
  onEdit: (student: StudentRow) => void;
}

export function studentColumns({
  onEdit,
}: StudentColumnsOptions): ColumnDef<StudentRow, unknown>[] {
  return [
    indexColumn<StudentRow>(),
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} label="Nama" />,
      cell: ({ row }) => (
        <div>
          <p className="text-foreground font-semibold">{row.original.name}</p>
          <p className="text-muted-foreground text-xs">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "nis",
      header: ({ column }) => <SortableHeader column={column} label="NIS" />,
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.nis}</span>
      ),
    },
    {
      accessorKey: "specialization",
      header: "Program",
      cell: ({ row }) =>
        SPECIALIZATION_SHORT_LABELS[row.original.specialization] ??
        row.original.specialization,
    },
    {
      accessorKey: "angkatan",
      header: ({ column }) => (
        <SortableHeader column={column} label="Angkatan" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.angkatan}</span>
      ),
    },
    {
      accessorKey: "className",
      header: ENTITY_LABELS.CLASS,
      cell: ({ row }) =>
        row.original.className ?? (
          <span className="text-muted-foreground">Belum ditempatkan</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={STUDENT_STATUS_BADGES[row.original.status]}>
          {STUDENT_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <StudentActions student={row.original} onEdit={onEdit} />
      ),
    },
  ];
}
