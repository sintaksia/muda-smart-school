import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../_components/PageHeader";
import { Badge } from "../_components/Badge";
import { dateOnlyUtc, toWibParts } from "@/src/features/attendance/utils/time";
import {
  DAY_OF_WEEK_LABELS,
  SESSION_STATUS_BADGES,
  SESSION_STATUS_LABELS,
} from "@/src/lib/constants";

export const dynamic = "force-dynamic";

export default async function AbsensiMonitorPage() {
  const { dateISO, dayOfWeek } = toWibParts(new Date());

  const jadwal = dayOfWeek
    ? await prisma.schedule.findMany({
        where: { dayOfWeek, isActive: true },
        include: {
          schoolClass: { select: { name: true } },
          subject: { select: { name: true } },
          teacher: { select: { user: { select: { name: true } } } },
          sessions: {
            where: { date: dateOnlyUtc(dateISO) },
            include: { studentAttendance: { select: { status: true } } },
          },
        },
        orderBy: { startTime: "asc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sesi Hari Ini"
        description={`Pemantauan sesi kelas ${dayOfWeek ? DAY_OF_WEEK_LABELS[dayOfWeek] : "Minggu"}, ${dateISO}`}
      />

      <section className="border-hairline rounded-card border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-hairline text-ink-muted border-b text-left text-xs font-semibold uppercase tracking-wide">
                <th className="px-5 py-3">Jam</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Mapel</th>
                <th className="px-4 py-3">Guru</th>
                <th className="px-4 py-3">Status Sesi</th>
                <th className="px-4 py-3 text-right">Hadir</th>
              </tr>
            </thead>
            <tbody>
              {jadwal.map((row) => {
                const session = row.sessions[0];
                const hadir = session?.studentAttendance.filter(
                  (a) => a.status === "PRESENT" || a.status === "LATE",
                ).length;
                return (
                  <tr
                    key={row.id}
                    className="border-hairline border-b last:border-b-0"
                  >
                    <td className="text-ink px-5 py-3 font-semibold tabular-nums">
                      {row.startTime}–{row.endTime}
                    </td>
                    <td className="text-ink px-4 py-3">
                      {row.schoolClass.name}
                    </td>
                    <td className="text-ink-secondary px-4 py-3">
                      {row.subject.name}
                    </td>
                    <td className="text-ink-secondary px-4 py-3">
                      {row.teacher.user.name}
                    </td>
                    <td className="px-4 py-3">
                      {session ? (
                        <Badge variant={SESSION_STATUS_BADGES[session.status]}>
                          {SESSION_STATUS_LABELS[session.status]}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Belum dibuka</Badge>
                      )}
                    </td>
                    <td className="text-ink px-4 py-3 text-right font-semibold tabular-nums">
                      {session ? (hadir ?? 0) : "—"}
                    </td>
                  </tr>
                );
              })}
              {jadwal.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-ink-muted px-5 py-12 text-center"
                  >
                    Tidak ada jadwal untuk hari ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
