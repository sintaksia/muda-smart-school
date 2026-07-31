import type { ReactNode } from "react";

export interface InfoItem {
  label: string;
  value: ReactNode;
}

interface StudentInfoCardProps {
  title: string;
  items: InfoItem[];
}

/** Hairline card holding a label/value list — used by every detail section. */
export function StudentInfoCard({ title, items }: StudentInfoCardProps) {
  return (
    <section className="border-border rounded-md border bg-white">
      <h2 className="border-border text-foreground border-b px-5 py-3 text-sm font-semibold">
        {title}
      </h2>
      <dl className="grid gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-muted-foreground text-xs font-semibold">
              {item.label}
            </dt>
            <dd className="text-foreground text-sm">{item.value || "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
