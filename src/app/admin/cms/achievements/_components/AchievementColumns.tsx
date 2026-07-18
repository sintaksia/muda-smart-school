"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Medal, Trophy, Star } from "lucide-react";
import { SortableHeader } from "@/src/app/admin/_components/SortableHeader";
import { StatusBadge } from "@/src/app/admin/_components/StatusBadge";
import { AchievementActions } from "./AchievementActions";
import { achievementLevels, medalTypes } from "./AchievementSchema";
import type { Achievement } from "@/src/features/cms/services/achievements";

const getLevelLabel = (level: string) => {
  return achievementLevels.find((l) => l.value === level)?.label || level;
};

const getMedalLabel = (medalType: string | null) => {
  if (!medalType) return null;
  return medalTypes.find((m) => m.value === medalType)?.label || medalType;
};

const getMedalColor = (medalType: string | null) => {
  switch (medalType) {
    case "GOLD":
      return "text-yellow-600 bg-yellow-100";
    case "SILVER":
      return "text-gray-600 bg-gray-100";
    case "BRONZE":
      return "text-orange-700 bg-orange-100";
    case "JUARA_1":
      return "text-yellow-700 bg-yellow-100";
    case "JUARA_2":
      return "text-gray-700 bg-gray-100";
    case "JUARA_3":
      return "text-orange-700 bg-orange-100";
    case "HARAPAN_1":
    case "HARAPAN_2":
    case "HARAPAN_3":
      return "text-primary-700 bg-primary-100";
    default:
      return "";
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "INTERNASIONAL":
      return "bg-primary-100 text-primary-700";
    case "NASIONAL":
      return "bg-green-100 text-green-700";
    case "PROVINSI":
      return "bg-blue-100 text-blue-700";
    case "KOTA":
      return "bg-purple-100 text-purple-700";
    case "KECAMATAN":
      return "bg-orange-100 text-orange-700";
    case "SEKOLAH":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const achievementColumns: ColumnDef<Achievement>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const pageRows = table.getRowModel().rows;
      const visualIndex = pageRows.findIndex((r) => r.id === row.id);
      return (
        <span className="text-muted-foreground">
          {pageIndex * pageSize + visualIndex + 1}
        </span>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column} label="Prestasi" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <span className="font-medium">{row.original.title}</span>
      </div>
    ),
  },
  {
    accessorKey: "event",
    header: ({ column }) => (
      <SortableHeader column={column} label="Event/Kompetisi" />
    ),
  },
  {
    accessorKey: "level",
    header: ({ column }) => <SortableHeader column={column} label="Tingkat" />,
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getLevelColor(
          row.original.level,
        )}`}
      >
        {getLevelLabel(row.original.level)}
      </span>
    ),
  },
  {
    accessorKey: "medalType",
    header: "Peringkat",
    cell: ({ row }) => {
      const medalType = row.original.medalType;
      if (!medalType) {
        return <span className="text-muted-foreground">-</span>;
      }
      const isMedal = ["GOLD", "SILVER", "BRONZE"].includes(medalType);
      const IconComponent = isMedal ? Medal : Trophy;
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getMedalColor(
            medalType,
          )}`}
        >
          <IconComponent className="h-3 w-3" />
          {getMedalLabel(medalType)}
        </span>
      );
    },
  },
  {
    accessorKey: "year",
    header: ({ column }) => <SortableHeader column={column} label="Tahun" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.year}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => <StatusBadge isActive={row.original.isActive} />,
  },
  {
    accessorKey: "isHighlight",
    header: ({ column }) => <SortableHeader column={column} label="Beranda" />,
    cell: ({ row }) =>
      row.original.isHighlight ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
          <Star className="h-3 w-3 fill-yellow-500" />
          Tampil
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <AchievementActions achievement={row.original} />,
  },
];
