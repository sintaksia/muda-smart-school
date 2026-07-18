"use client";

import { DataTable } from "@/src/app/admin/_components/DataTable";
import { socialLinksColumns } from "./SocialLinksColumns";
import type { SocialLink } from "@/src/features/cms/services/social-links";

interface SocialLinksTableProps {
  data: SocialLink[];
}

export function SocialLinksTable({ data }: SocialLinksTableProps) {
  return (
    <DataTable
      columns={socialLinksColumns}
      data={data}
      searchPlaceholder="Cari tautan sosial..."
      emptyMessage="Belum ada data tautan sosial."
    />
  );
}
