import { PageHeader } from "../_components/PageHeader";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { getTeacherList } from "@/src/features/master/services/teacher";
import { getSubjectList } from "@/src/features/master/services/subject";
import { TeacherManager } from "./_components/TeacherManager";

export const dynamic = "force-dynamic";

export default async function GuruPage() {
  const [teacherList, subjectList] = await Promise.all([
    getTeacherList(),
    getSubjectList(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={ENTITY_LABELS.TEACHER}
        description="Kelola akun guru dan kualifikasi mata pelajaran"
      />
      <TeacherManager
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
