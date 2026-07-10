import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  STATUS_PENDAFTARAN_BADGES,
  STATUS_PENDAFTARAN_LABELS,
} from "@/src/lib/constants";
import type { Pendaftaran } from "@/src/features/registration/services";
import { DetailItem, formatDate } from "./DetailItem";

export function DokumenTab({ registration }: { registration: Pendaftaran }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Pendaftaran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailItem
            label="No. Pendaftaran"
            value={registration.nomorPendaftaran || "-"}
          />
          <DetailItem
            label="Tanggal Pendaftaran"
            value={formatDate(registration.tanggalPendaftaran)}
          />
          <DetailItem
            label="Status"
            value={
              <Badge
                variant={
                  STATUS_PENDAFTARAN_BADGES[registration.status] ?? "warning"
                }
              >
                {STATUS_PENDAFTARAN_LABELS[registration.status] ??
                  registration.status}
              </Badge>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
