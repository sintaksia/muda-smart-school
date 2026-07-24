import { PageHeader } from "../_components/PageHeader";
import { getStudentList } from "@/src/features/master/services/student";
import { prisma } from "@/src/lib/prisma";
import { StudentTable } from "./_components/StudentTable";

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
        title="Siswa"
        description="Penempatan kelas dan status siswa — akun dibuat dari menu Pendaftaran"
      />
      <StudentTable
        studentList={studentList.map((student) => ({
          id: student.id,
          name: student.user.name,
          nis: student.nis,
          specialization: student.specialization,
          angkatan: student.angkatan,
          classId: student.schoolClass?.id ?? null,
          status: student.status,
        }))}
        classOptions={classList}
      />
    </div>
  );
}
