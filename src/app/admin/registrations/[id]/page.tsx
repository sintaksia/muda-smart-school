import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Printer, Download } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/app/admin/_components/Badge";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { RegistrationDetail } from "../_components/RegistrationDetail";
import { RegistrationStatusActions } from "../_components/RegistrationStatusActions";
import { getRegistrationById } from "@/src/features/registration/services";
import {
  REGISTRATION_STATUS_BADGES,
  REGISTRATION_STATUS_LABELS,
} from "@/src/lib/constants";

interface RegistrationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RegistrationDetailPage({
  params,
}: RegistrationDetailPageProps) {
  const { id } = await params;
  const registration = await getRegistrationById(id);

  if (!registration) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header dengan Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/admin/registrations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar
            </Link>
          </Button>
          <PageHeader
            title={`Detail Pendaftaran: ${registration.fullName}`}
            description={`No. Pendaftaran: ${registration.registrationNumber || "-"}`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/api/admin/registrations/${id}/print`} target="_blank">
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/api/admin/registrations/${id}/print`} target="_blank">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/admin/registrations/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <Badge
          variant={REGISTRATION_STATUS_BADGES[registration.status] ?? "warning"}
          className="text-sm py-1.5 px-3"
        >
          {REGISTRATION_STATUS_LABELS[registration.status] ??
            registration.status}
        </Badge>
      </div>

      {/* Main Content */}
      <RegistrationDetail registration={registration} />

      {/* Validation Card (untuk admin) */}
      {(registration.status === "PENDING" ||
        registration.status === "VERIFIED") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Validasi Pendaftaran</CardTitle>
          </CardHeader>
          <CardContent>
            <RegistrationStatusActions id={id} status={registration.status} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
