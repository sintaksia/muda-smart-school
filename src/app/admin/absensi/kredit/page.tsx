import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../../_components/PageHeader";
import { CreditManager } from "./_components/CreditManager";

export const dynamic = "force-dynamic";

export default async function CreditAdminPage() {
  const [students, teachers, categories] = await Promise.all([
    prisma.student.findMany({
      where: { status: "AKTIF" },
      select: {
        id: true,
        nis: true,
        user: { select: { name: true } },
        schoolClass: { select: { name: true } },
      },
      orderBy: { nis: "asc" },
    }),
    prisma.teacher.findMany({
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
          name: `${s.user.name} (${s.schoolClass?.name ?? s.nis})`,
        }))}
        teachers={teachers.map((t) => ({ id: t.id, name: t.user.name }))}
        categories={categories.map((c) => ({
          ownerType: c.ownerType,
          type: c.type,
          name: c.name,
        }))}
      />
    </div>
  );
}
