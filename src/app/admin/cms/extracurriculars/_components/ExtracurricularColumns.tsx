"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Activity } from "lucide-react";
import { SortableHeader } from "@/src/app/admin/_components/SortableHeader";
import { StatusBadge } from "@/src/app/admin/_components/StatusBadge";
import { ExtracurricularActions } from "./ExtracurricularActions";
import { indexColumn } from "@/src/app/admin/_components/indexColumn";
import { ekskulCategories } from "./ExtracurricularSchema";
import type { Extracurricular } from "@/src/features/cms/services/extracurriculars";

const getCategoryLabel = (category: string): string => {
  return ekskulCategories.find((c) => c.value === category)?.label || category;
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case "ORGANIZATION":
      return "bg-primary-100 text-primary-700";
    case "SCOUTING":
      return "bg-green-100 text-green-700";
    case "MARTIAL_ARTS":
      return "bg-red-100 text-red-700";
    case "SPORTS":
      return "bg-blue-100 text-blue-700";
    case "ARTS":
      return "bg-purple-100 text-purple-700";
    case "ACADEMIC":
      return "bg-yellow-100 text-yellow-700";
    case "RELIGIOUS":
      return "bg-emerald-100 text-emerald-700";
    case "OTHER":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const extracurricularColumns: ColumnDef<Extracurricular>[] = [
  indexColumn<Extracurricular>(),
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column} label="Ekstrakurikuler" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.icon ? (
          <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
            <svg
              className="w-4 h-4 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={row.original.icon}
              />
            </svg>
          </div>
        ) : (
          <Activity className="h-4 w-4 text-yellow-500" />
        )}
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => <SortableHeader column={column} label="Kategori" />,
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(
          row.original.category,
        )}`}
      >
        {getCategoryLabel(row.original.category)}
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
    cell: ({ row }) => (
      <ExtracurricularActions extracurricular={row.original} />
    ),
  },
];
