"use client";

import { DataTable } from "@/src/app/admin/_components/DataTable";
import { faqColumns } from "./FaqColumns";
import type { Faq } from "@/src/features/cms/services/faqs";

interface FaqTableProps {
  data: Faq[];
}

export function FaqTable({ data }: FaqTableProps) {
  return (
    <DataTable
      columns={faqColumns}
      data={data}
      searchPlaceholder="Cari FAQ..."
      emptyMessage="Belum ada data FAQ."
    />
  );
}
