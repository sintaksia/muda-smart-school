import { CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { adminActionItemOptions } from "@/src/features/dashboard/constants";
import type { AdminActionCounts } from "@/src/features/dashboard/services/actionItems";
import { ActionItemRow } from "./ActionItemRow";

interface ActionCenterCardProps {
  counts: AdminActionCounts;
}

export function ActionCenterCard({ counts }: ActionCenterCardProps) {
  const pending = adminActionItemOptions.filter(
    (option) => counts[option.key] > 0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perlu Tindakan</CardTitle>
        <CardDescription>
          Item yang menunggu tindak lanjut admin
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Semua sudah ditindaklanjuti.
          </div>
        ) : (
          <div className="-mx-2 space-y-1">
            {pending.map((option) => (
              <ActionItemRow
                key={option.key}
                label={option.label}
                description={option.description}
                href={option.href}
                count={counts[option.key]}
                badge={option.badge}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
