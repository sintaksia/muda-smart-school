import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  REGISTRATION_STATUS_LABELS,
  REGISTRATION_STATUS_BADGES,
  SPECIALIZATION_LABELS,
} from "@/src/lib/constants";
import type { getRecentRegistrations } from "@/src/features/registration/services";

type RecentRegistration = Awaited<
  ReturnType<typeof getRecentRegistrations>
>[number];

interface RecentRegistrationsCardProps {
  registrations: RecentRegistration[];
}

export function RecentRegistrationsCard({
  registrations,
}: RecentRegistrationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pendaftaran Terbaru</CardTitle>
        <CardDescription>Daftar calon siswa yang baru mendaftar</CardDescription>
      </CardHeader>
      <CardContent>
        {registrations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada pendaftaran.</p>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {registration.fullName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {registration.registrationNumber} &middot;{" "}
                    {SPECIALIZATION_LABELS[registration.specialization] ??
                      registration.specialization}
                  </p>
                </div>
                <Badge variant={REGISTRATION_STATUS_BADGES[registration.status]}>
                  {REGISTRATION_STATUS_LABELS[registration.status]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
