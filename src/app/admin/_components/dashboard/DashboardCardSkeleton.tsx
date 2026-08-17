import {
  Card,
  CardContent,
  CardHeader,
} from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

/** Streaming placeholder for a dashboard feed card (title + 3 rows). */
export function DashboardCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center justify-between gap-4">
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
