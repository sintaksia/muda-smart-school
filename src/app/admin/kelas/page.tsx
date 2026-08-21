import { PageHeader } from "../_components/PageHeader";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { getClassList } from "@/src/features/master/services/schoolClass";
import { getActiveAcademicYear } from "@/src/features/master/services/academicYear";
import { prisma } from "@/src/lib/prisma";
import { ClassManager } from "./_components/ClassManager";

export const dynamic = "force-dynamic";

export default async function KelasPage() {
  const [classList, teacherList, activeAcademicYear] = await Promise.all([
    getClassList(),
    prisma.teacher.findMany({
      select: { id: true, user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    getActiveAcademicYear(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={ENTITY_LABELS.CLASS}
        description="Kelola rombongan belajar dan wali kelas"
      />
      <ClassManager
        classList={classList.map((schoolClass) => ({
          id: schoolClass.id,
          name: schoolClass.name,
          gradeLevel: schoolClass.gradeLevel,
          specialization: schoolClass.specialization,
          academicYear: schoolClass.academicYear,
          homeroomTeacherId: schoolClass.homeroomTeacher?.id ?? null,
          homeroomTeacher: schoolClass.homeroomTeacher?.user.name ?? null,
          studentCount: schoolClass._count.students,
        }))}
        teacherOptions={teacherList.map((teacher) => ({
          id: teacher.id,
          name: teacher.user.name,
        }))}
        activeAcademicYear={activeAcademicYear}
      />
    </div>
  );
}
