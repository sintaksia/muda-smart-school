import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { dateOnlyUtc, toWibParts } from "@/src/features/attendance/utils/time";
import { DAY_OF_WEEK_LABELS } from "@/src/lib/constants";
import { SessionList } from "./_components/SessionList";

export const dynamic = "force-dynamic";

export default async function GuruDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
  });
  if (!teacher) {
    redirect("/login");
  }

  const { dateISO, dayOfWeek } = toWibParts(new Date());
  const jadwal = dayOfWeek
    ? await prisma.schedule.findMany({
        where: { dayOfWeek, isActive: true, teacherId: teacher.id },
        include: {
          schoolClass: { select: { name: true } },
          subject: { select: { name: true } },
          sessions: { where: { date: dateOnlyUtc(dateISO) } },
        },
        orderBy: { startTime: "asc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ink text-[28px] font-bold tracking-tight">
          Sesi Mengajar Hari Ini
        </h1>
        <p className="text-ink-secondary mt-1 text-sm">
          {dayOfWeek ? DAY_OF_WEEK_LABELS[dayOfWeek] : "Minggu"}, {dateISO}
        </p>
      </div>
      <SessionList
        items={jadwal.map((row) => ({
          jadwalId: row.id,
          jam: `${row.startTime}–${row.endTime}`,
          kelas: row.schoolClass.name,
          mapel: row.subject.name,
          sesiId: row.sessions[0]?.id ?? null,
          sesiStatus: row.sessions[0]?.status ?? null,
        }))}
      />
    </div>
  );
}
