"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Building2 } from "lucide-react";
import { SortableHeader } from "@/src/app/admin/_components/SortableHeader";
import { StatusBadge } from "@/src/app/admin/_components/StatusBadge";
import { FacilityActions } from "./FacilityActions";
import { indexColumn } from "@/src/app/admin/_components/indexColumn";
import type { Facility } from "@/src/features/cms/services/facilities";
import { ICON_MAP } from "@/src/lib/icons";

export const facilityColumns: ColumnDef<Facility>[] = [
  indexColumn<Facility>(),
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column} label="Fasilitas" />
    ),
    cell: ({ row }) => {
      const iconName = row.original.icon;
      const Icon =
        iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : Building2;
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
            <Icon className="w-4 h-4 text-green-600" />
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm line-clamp-1">
        {row.original.description || "-"}
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
    cell: ({ row }) => <FacilityActions facility={row.original} />,
  },
];
