import { PageHeader } from "../_components/PageHeader";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { getStudentList } from "@/src/features/master/services/student";
import { toStudentRow } from "@/src/features/master/utils/studentRow";
import { prisma } from "@/src/lib/prisma";
import { StudentManager } from "./_components/StudentManager";

export const dynamic = "force-dynamic";

export default async function SiswaPage() {
  const [studentList, classList] = await Promise.all([
    getStudentList(),
    prisma.schoolClass.findMany({
      select: { id: true, name: true },
      orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={ENTITY_LABELS.STUDENT}
        description="Tambah, ubah, impor dan ekspor data siswa — termasuk siswa yang tidak berasal dari pendaftaran online"
      />
      <StudentManager
        students={studentList.map(toStudentRow)}
        classOptions={classList}
      />
    </div>
  );
}
