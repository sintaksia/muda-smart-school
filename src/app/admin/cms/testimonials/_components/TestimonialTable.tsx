"use client";

import { DataTable } from "@/src/app/admin/_components/DataTable";
import { testimonialColumns } from "./TestimonialColumns";
import type { Testimonial } from "@/src/features/cms/services/testimonials";

interface TestimonialTableProps {
  data: Testimonial[];
}

export function TestimonialTable({ data }: TestimonialTableProps) {
  return (
    <DataTable
      columns={testimonialColumns}
      data={data}
      searchPlaceholder="Cari testimoni..."
      emptyMessage="Belum ada data testimoni."
    />
  );
}
