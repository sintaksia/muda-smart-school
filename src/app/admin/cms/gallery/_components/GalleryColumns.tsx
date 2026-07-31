"use client";

/* eslint-disable ds/off-palette -- categorical encoding: gallery category; see docs/design_system.md §2.4 */
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { ImageIcon } from "lucide-react";
import { SortableHeader } from "@/src/app/admin/_components/SortableHeader";
import { StatusBadge } from "@/src/app/admin/_components/StatusBadge";
import { GalleryActions } from "./GalleryActions";
import { indexColumn } from "@/src/app/admin/_components/indexColumn";
import { galleryCategories } from "./GallerySchema";
import type { Gallery } from "@/src/features/cms/services/gallery";

const getCategoryLabel = (category: string) => {
  return galleryCategories.find((c) => c.value === category)?.label || category;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "FACILITIES":
      return "bg-primary-100 text-primary-700";
    case "ACTIVITIES":
      return "bg-green-100 text-green-700";
    case "ACHIEVEMENTS":
      return "bg-yellow-100 text-yellow-700";
    case "EXTRACURRICULAR":
      return "bg-purple-100 text-purple-700";
    case "OTHER":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const galleryColumns: ColumnDef<Gallery>[] = [
  indexColumn<Gallery>(),
  {
    accessorKey: "image",
    header: "Gambar",
    cell: ({ row }) => {
      const image = row.original.image;
      return image ? (
        <div className="relative h-12 w-16 overflow-hidden rounded">
          <Image
            src={image}
            alt={row.original.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-100">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column} label="Judul" />,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.title}</span>
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
    cell: ({ row }) => <GalleryActions gallery={row.original} />,
  },
];
