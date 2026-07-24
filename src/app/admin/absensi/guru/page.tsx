import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../../_components/PageHeader";
import { TeacherAbsenceManager } from "./_components/TeacherAbsenceManager";

export const dynamic = "force-dynamic";

export default async function TeacherAbsencePage() {
  const [records, teacherList] = await Promise.all([
    prisma.teacherAttendance.findMany({
      include: {
        teacher: { select: { user: { select: { name: true } } } },
        substituteTeacher: { select: { user: { select: { name: true } } } },
        schedule: {
          select: {
            startTime: true,
            endTime: true,
            schoolClass: { select: { name: true } },
            subject: { select: { name: true } },
          },
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.teacher.findMany({
      select: { id: true, user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Absensi Guru"
        description="Catat ketidakhadiran guru dan tugaskan guru pengganti"
      />
      <TeacherAbsenceManager
        records={records.map((record) => ({
          id: record.id,
          teacherName: record.teacher.user.name,
          date: record.date.toISOString().slice(0, 10),
          status: record.status,
          className: record.schedule.schoolClass.name,
          subjectName: record.schedule.subject.name,
          time: `${record.schedule.startTime}–${record.schedule.endTime}`,
          substitute: record.substituteTeacher?.user.name ?? null,
        }))}
        teacherOptions={teacherList.map((t) => ({
          id: t.id,
          name: t.user.name,
        }))}
      />
    </div>
  );
}
