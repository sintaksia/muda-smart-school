import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../../_components/PageHeader";
import { IzinReviewTable } from "./_components/IzinReviewTable";

export const dynamic = "force-dynamic";

export default async function IzinAdminPage() {
  const submissions = await prisma.pengajuanIzin.findMany({
    include: {
      student: {
        select: {
          nis: true,
          user: { select: { name: true } },
          kelas: { select: { nama: true } },
        },
      },
      reviewedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Izin / Sakit"
        description="Tinjau dan setujui pengajuan izin & sakit siswa"
      />
      <IzinReviewTable
        submissions={submissions.map((izin) => ({
          id: izin.id,
          nama: izin.student.user.name,
          kelas: izin.student.kelas?.nama ?? "—",
          jenis: izin.jenis,
          tanggal: izin.tanggal.toISOString().slice(0, 10),
          alasan: izin.alasan,
          status: izin.status,
          reviewedBy: izin.reviewedBy?.name ?? null,
        }))}
      />
    </div>
  );
}
