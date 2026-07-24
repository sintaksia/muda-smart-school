import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  REGISTRATION_STATUS_BADGES,
  REGISTRATION_STATUS_LABELS,
} from "@/src/lib/constants";
import type { Registration } from "@/src/features/registration/services";
import { DetailItem, formatDate } from "./DetailItem";

export function DokumenTab({ registration }: { registration: Registration }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Pendaftaran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailItem
            label="No. Pendaftaran"
            value={registration.registrationNumber || "-"}
          />
          <DetailItem
            label="Tanggal Pendaftaran"
            value={formatDate(registration.registrationDate)}
          />
          <DetailItem
            label="Status"
            value={
              <Badge
                variant={
                  REGISTRATION_STATUS_BADGES[registration.status] ?? "warning"
                }
              >
                {REGISTRATION_STATUS_LABELS[registration.status] ??
                  registration.status}
              </Badge>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
