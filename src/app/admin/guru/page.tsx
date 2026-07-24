import { PageHeader } from "../_components/PageHeader";
import { getTeacherList } from "@/src/features/master/services/guru";
import { getSubjectList } from "@/src/features/master/services/mapel";
import { GuruManager } from "./_components/GuruManager";

export const dynamic = "force-dynamic";

export default async function GuruPage() {
  const [teacherList, subjectList] = await Promise.all([
    getTeacherList(),
    getSubjectList(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guru"
        description="Kelola akun guru dan kualifikasi mata pelajaran"
      />
      <GuruManager
        teacherList={teacherList.map((teacher) => ({
          id: teacher.id,
          name: teacher.user.name,
          email: teacher.user.email,
          nip: teacher.nip,
          employmentStatus: teacher.employmentStatus,
          subjects: teacher.teacherSubjects.map((ts) => ts.subject.name),
          homeroomClasses: teacher.homeroomClasses.map((k) => k.name),
        }))}
        subjectOptions={subjectList.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
