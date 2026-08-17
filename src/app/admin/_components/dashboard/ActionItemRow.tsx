import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/src/app/admin/_components/Badge";
import type { BadgeProps } from "@/src/app/admin/_components/Badge";

interface ActionItemRowProps {
  label: string;
  description: string;
  href: string;
  count: number;
  badge: BadgeProps["variant"];
}

export function ActionItemRow({
  label,
  description,
  href,
  count,
  badge,
}: ActionItemRowProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-sm px-2 py-2 transition-colors hover:bg-muted"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={badge}>{count}</Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
