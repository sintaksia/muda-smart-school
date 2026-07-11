import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/app/admin/_components/Badge";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { getSiswaDetail } from "@/src/features/master/services/siswa";
import {
  STUDENT_STATUS_BADGES,
  STUDENT_STATUS_LABELS,
} from "@/src/lib/constants";
import { SiswaDetail } from "../_components/detail/SiswaDetail";

export const dynamic = "force-dynamic";

interface SiswaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SiswaDetailPage({
  params,
}: SiswaDetailPageProps) {
  const { id } = await params;
  const detail = await getSiswaDetail(id);

  if (!detail) {
    notFound();
  }

  const { siswa } = detail;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/admin/siswa">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar
            </Link>
          </Button>
          <PageHeader
            title={siswa.user.name}
            description={`NIS ${siswa.nis} · NISN ${siswa.nisn}`}
          />
        </div>
        <Button size="sm" asChild>
          <Link href={`/admin/siswa/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <Badge
        variant={STUDENT_STATUS_BADGES[siswa.status] ?? "warning"}
        className="px-3 py-1.5 text-sm"
      >
        {STUDENT_STATUS_LABELS[siswa.status] ?? siswa.status}
      </Badge>

      <SiswaDetail detail={detail} />
    </div>
  );
}
