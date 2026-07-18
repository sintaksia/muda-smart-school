"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Quote } from "lucide-react";
import { SortableHeader } from "@/src/app/admin/_components/SortableHeader";
import { StatusBadge } from "@/src/app/admin/_components/StatusBadge";
import { Badge } from "@/src/app/admin/_components/Badge";
import { indexColumn } from "@/src/app/admin/_components/indexColumn";
import {
  TESTIMONIAL_TYPE_LABELS,
  TESTIMONIAL_TYPE_BADGES,
} from "@/src/lib/constants";
import { TestimonialActions } from "./TestimonialActions";
import type { Testimonial } from "@/src/features/cms/services/testimonials";

export const testimonialColumns: ColumnDef<Testimonial>[] = [
  indexColumn<Testimonial>(),
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} label="Nama" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 max-w-[240px]">
        <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center shrink-0">
          <Quote className="w-4 h-4 text-primary-600" />
        </div>
        <div className="min-w-0">
          <p className="font-medium whitespace-normal line-clamp-1">
            {row.original.name}
          </p>
          <p className="text-xs text-muted-foreground whitespace-normal line-clamp-1">
            {row.original.role}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "quote",
    header: "Testimoni",
    cell: ({ row }) => (
      <span className="block max-w-[400px] text-muted-foreground text-sm whitespace-normal line-clamp-2">
        {row.original.quote}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) => (
      <Badge variant={TESTIMONIAL_TYPE_BADGES[row.original.type] ?? "default"}>
        {TESTIMONIAL_TYPE_LABELS[row.original.type] ?? row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "order",
    header: ({ column }) => <SortableHeader column={column} label="Urutan" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.order}</span>
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
    cell: ({ row }) => <TestimonialActions testimonial={row.original} />,
  },
];
