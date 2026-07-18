"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { ImageIcon } from "lucide-react";
import { SortableHeader } from "@/src/app/admin/_components/SortableHeader";
import { StatusBadge } from "@/src/app/admin/_components/StatusBadge";
import { HeroSlideActions } from "./HeroSlideActions";
import { indexColumn } from "@/src/app/admin/_components/indexColumn";
import type { HeroSlide } from "@/src/features/cms/services/hero-slides";

export const heroSlideColumns: ColumnDef<HeroSlide>[] = [
  indexColumn<HeroSlide>(),
  {
    accessorKey: "image",
    header: "Gambar",
    cell: ({ row }) => {
      const image = row.original.image;
      return image ? (
        <div className="relative h-12 w-20 overflow-hidden rounded">
          <Image
            src={image}
            alt={row.original.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-12 w-20 items-center justify-center rounded bg-gray-100">
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
    accessorKey: "subtitle",
    header: ({ column }) => <SortableHeader column={column} label="Subtitle" />,
    cell: ({ row }) => {
      const subtitle = row.original.subtitle;
      if (!subtitle) return <span className="text-muted-foreground">-</span>;
      return (
        <span className="text-muted-foreground">
          {subtitle.length > 50 ? `${subtitle.slice(0, 50)}...` : subtitle}
        </span>
      );
    },
  },
  {
    id: "cta",
    header: "CTA",
    cell: ({ row }) => {
      const { ctaText, ctaLink } = row.original;
      if (!ctaText) return <span className="text-muted-foreground">-</span>;
      return (
        <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
          {ctaText}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => <StatusBadge isActive={row.original.isActive} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <HeroSlideActions heroSlide={row.original} />,
  },
];
