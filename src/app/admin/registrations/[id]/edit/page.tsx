import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { RegistrationEditForm } from "../../_components/RegistrationEditForm";
import { getRegistrationById } from "@/src/features/registration/services";

interface RegistrationEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function RegistrationEditPage({
  params,
}: RegistrationEditPageProps) {
  const { id } = await params;
  const registration = await getRegistrationById(id);

  if (!registration) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`/admin/registrations/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Detail
          </Link>
        </Button>
        <PageHeader
          title={`Edit Pendaftaran: ${registration.namaLengkap}`}
          description={`No. Pendaftaran: ${registration.nomorPendaftaran || "-"}`}
        />
      </div>

      <RegistrationEditForm registration={registration} />
    </div>
  );
}
