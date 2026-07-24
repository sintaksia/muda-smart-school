import { PageHeader } from "../_components/PageHeader";
import { getSubjectList } from "@/src/features/master/services/subject";
import { SubjectManager } from "./_components/SubjectManager";

export const dynamic = "force-dynamic";

export default async function MapelPage() {
  const subjectList = await getSubjectList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mata Pelajaran"
        description="Kelola daftar mata pelajaran"
      />
      <SubjectManager
        subjectList={subjectList.map((subject) => ({
          id: subject.id,
          name: subject.name,
          code: subject.code,
          specialization: subject.specialization,
          gradeLevel: subject.gradeLevel,
          jumlahGuru: subject._count.teacherSubjects,
          jumlahJadwal: subject._count.schedules,
        }))}
      />
    </div>
  );
}
