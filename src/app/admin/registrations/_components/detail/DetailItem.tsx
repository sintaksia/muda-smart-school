import type { ReactNode } from "react";

export function DetailItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base">{value}</p>
    </div>
  );
}

export function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID");
}

export function formatYear(year: number | null): string {
  return year ? year.toString() : "-";
}
