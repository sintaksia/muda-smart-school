import { PageHeader } from "../_components/PageHeader";
import { getKelasList } from "@/src/features/master/services/kelas";
import { prisma } from "@/src/lib/prisma";
import { KelasManager } from "./_components/KelasManager";

export const dynamic = "force-dynamic";

export default async function KelasPage() {
  const [kelasList, guruList] = await Promise.all([
    getKelasList(),
    prisma.teacher.findMany({
      select: { id: true, user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelas"
        description="Kelola rombongan belajar dan wali kelas"
      />
      <KelasManager
        kelasList={kelasList.map((kelas) => ({
          id: kelas.id,
          name: kelas.name,
          gradeLevel: kelas.gradeLevel,
          specialization: kelas.specialization,
          academicYear: kelas.academicYear,
          homeroomTeacherId: kelas.homeroomTeacher?.id ?? null,
          homeroomTeacher: kelas.homeroomTeacher?.user.name ?? null,
          jumlahSiswa: kelas._count.students,
        }))}
        guruOptions={guruList.map((g) => ({ id: g.id, name: g.user.name }))}
      />
    </div>
  );
}
