"use client";

import { ColumnDef } from "@tanstack/react-table";
import { HelpCircle } from "lucide-react";
import { SortableHeader } from "@/src/app/admin/_components/SortableHeader";
import { StatusBadge } from "@/src/app/admin/_components/StatusBadge";
import { FaqActions } from "./FaqActions";
import type { Faq } from "@/src/features/cms/services/faqs";

export const faqColumns: ColumnDef<Faq>[] = [
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
    accessorKey: "question",
    header: ({ column }) => (
      <SortableHeader column={column} label="Pertanyaan" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 max-w-[320px]">
        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center shrink-0">
          <HelpCircle className="w-4 h-4 text-green-600" />
        </div>
        <span className="font-medium whitespace-normal line-clamp-2">
          {row.original.question}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "answer",
    header: "Jawaban",
    cell: ({ row }) => (
      <span className="block max-w-[400px] text-muted-foreground text-sm whitespace-normal line-clamp-2">
        {row.original.answer}
      </span>
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
    cell: ({ row }) => <FaqActions faq={row.original} />,
  },
];
