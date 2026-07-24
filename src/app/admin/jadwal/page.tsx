import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../_components/PageHeader";
import { JadwalManager } from "./_components/JadwalManager";

export const dynamic = "force-dynamic";

export default async function JadwalPage() {
  const [jadwal, classList, subjectList, teacherList] = await Promise.all([
    prisma.schedule.findMany({
      where: { isActive: true },
      include: {
        schoolClass: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        teacher: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.schoolClass.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.teacher.findMany({
      select: { id: true, user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Pelajaran"
        description="Kelola jadwal guru × mapel × kelas dengan validasi bentrok otomatis"
      />
      <JadwalManager
        jadwal={jadwal.map((j) => ({
          id: j.id,
          dayOfWeek: j.dayOfWeek,
          startTime: j.startTime,
          endTime: j.endTime,
          classId: j.schoolClass.id,
          className: j.schoolClass.name,
          teacherId: j.teacher.id,
          teacherName: j.teacher.user.name,
          subjectName: j.subject.name,
        }))}
        classOptions={classList.map((k) => ({ id: k.id, name: k.name }))}
        subjectOptions={subjectList.map((m) => ({ id: m.id, name: m.name }))}
        teacherOptions={teacherList.map((g) => ({
          id: g.id,
          name: g.user.name,
        }))}
      />
    </div>
  );
}
