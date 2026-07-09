import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../../_components/PageHeader";
import { CreditManager } from "./_components/CreditManager";

export const dynamic = "force-dynamic";

export default async function CreditAdminPage() {
  const [students, gurus, categories] = await Promise.all([
    prisma.student.findMany({
      where: { status: "AKTIF" },
      select: {
        id: true,
        nis: true,
        user: { select: { name: true } },
        kelas: { select: { nama: true } },
      },
      orderBy: { nis: "asc" },
    }),
    prisma.guru.findMany({
      select: { id: true, user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.creditCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skor Kredit"
        description="Entri manual prestasi/pelanggaran dan pemantauan skor"
      />
      <CreditManager
        students={students.map((s) => ({
          id: s.id,
          nama: `${s.user.name} (${s.kelas?.nama ?? s.nis})`,
        }))}
        gurus={gurus.map((g) => ({ id: g.id, nama: g.user.name }))}
        categories={categories.map((c) => ({
          ownerType: c.ownerType,
          type: c.type,
          nama: c.nama,
        }))}
      />
    </div>
  );
}
