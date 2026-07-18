"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/src/app/admin/_components/SortableHeader";
import { StatusBadge } from "@/src/app/admin/_components/StatusBadge";
import { ProgramActions } from "./ProgramActions";
import { indexColumn } from "@/src/app/admin/_components/indexColumn";
import type { ProgramWithRelations } from "@/src/features/cms/services/programs";

export const programColumns: ColumnDef<ProgramWithRelations>[] = [
  indexColumn<ProgramWithRelations>(),
  {
    accessorKey: "abbreviation",
    header: ({ column }) => (
      <SortableHeader column={column} label="Singkatan" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: row.original.color }}
        />
        <span className="font-medium">{row.original.abbreviation}</span>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column} label="Nama Program" />
    ),
  },
  {
    accessorKey: "skills",
    header: "Kompetensi",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.skills.length} item
      </span>
    ),
  },
  {
    accessorKey: "careers",
    header: "Prospek Karir",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.careers.length} item
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => <StatusBadge isActive={row.original.isActive} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ProgramActions program={row.original} />,
  },
];
