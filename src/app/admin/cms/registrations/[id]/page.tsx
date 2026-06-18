import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Printer,
  Download,
  CheckCircle,
  XCircle,
  FileCheck,
} from "lucide-react";
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
import { getRegistrationById } from "@/src/features/registration/services";
import {
  STATUS_PENDAFTARAN_BADGES,
  STATUS_PENDAFTARAN_LABELS,
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
            <Link href="/admin/cms/registrations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar
            </Link>
          </Button>
          <PageHeader
            title={`Detail Pendaftaran: ${registration.namaLengkap}`}
            description={`No. Pendaftaran: ${registration.nomorPendaftaran || "-"}`}
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
            <Link href={`/admin/cms/registrations/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <Badge
          variant={STATUS_PENDAFTARAN_BADGES[registration.status] ?? "warning"}
          className="text-sm py-1.5 px-3"
        >
          {STATUS_PENDAFTARAN_LABELS[registration.status] ??
            registration.status}
        </Badge>
      </div>

      {/* Main Content */}
      <RegistrationDetail registration={registration} />

      {/* Validation Card (untuk admin) */}
      {registration.status === "PENDING" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Validasi Pendaftaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <form
                action={async () => {
                  "use server";
                  // Server Action untuk terima
                  const { updateRegistrationStatus } =
                    await import("@/src/features/registration/services");
                  await updateRegistrationStatus(id, "DITERIMA");
                }}
              >
                <Button type="submit" variant="default">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Terima Pendaftaran
                </Button>
              </form>

              <form
                action={async () => {
                  "use server";
                  // Server Action untuk tolak
                  const { updateRegistrationStatus } =
                    await import("@/src/features/registration/services");
                  await updateRegistrationStatus(id, "DITOLAK");
                }}
              >
                <Button type="submit" variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Tolak Pendaftaran
                </Button>
              </form>

              <form
                action={async () => {
                  "use server";
                  // Server Action untuk tandai terverifikasi
                  const { updateRegistrationStatus } =
                    await import("@/src/features/registration/services");
                  await updateRegistrationStatus(id, "DIVERIFIKASI");
                }}
              >
                <Button type="submit" variant="outline">
                  <FileCheck className="mr-2 h-4 w-4" />
                  Tandai Terverifikasi
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
