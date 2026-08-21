import type { AttendanceStatus, Prisma } from "@prisma/client";

import { prisma } from "@/src/lib/prisma";
import { dateOnlyUtc, toWibParts } from "@/src/features/attendance/utils/time";
import { ATTENDANCE_STATUS_VALUES, ENTITY_LABELS } from "@/src/lib/constants";
import { PageHeader } from "../../_components/PageHeader";
import { StudentAttendanceFilters } from "./_components/StudentAttendanceFilters";
import { StudentAttendanceSummary } from "./_components/StudentAttendanceSummary";
import { StudentAttendanceTable } from "./_components/StudentAttendanceTable";

export const dynamic = "force-dynamic";

/** One school day across every class stays well inside this; the cap only
 *  exists so an unfiltered query can never fetch unbounded rows. */
const RECORD_LIMIT = 200;

interface RecapPageProps {
  searchParams: Promise<{ date?: string; classId?: string; status?: string }>;
}

/** A search param is only trusted once it matches the shape the query expects. */
function resolveDate(raw: string | undefined): string {
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? raw
    : toWibParts(new Date()).dateISO;
}

function resolveStatus(raw: string | undefined): AttendanceStatus | "" {
  return raw && (ATTENDANCE_STATUS_VALUES as readonly string[]).includes(raw)
    ? (raw as AttendanceStatus)
    : "";
}

export default async function StudentAttendanceRecapPage({
  searchParams,
}: RecapPageProps) {
  const params = await searchParams;
  const date = resolveDate(params.date);
  const status = resolveStatus(params.status);
  const classId = params.classId ?? "";

  // The tiles recap the whole day so they can act as status filters — only the
  // table narrows to the selected status.
  // Scope by the schedule's class, not the student's current one: a student
  // promoted to XI must still appear under X in last year's recap.
  const dayScope: Prisma.StudentAttendanceWhereInput = {
    date: dateOnlyUtc(date),
    ...(classId ? { schedule: { classId } } : {}),
  };

  const [records, statusGroups, classList] = await Promise.all([
    prisma.studentAttendance.findMany({
      where: status ? { ...dayScope, status } : dayScope,
      include: {
        student: {
          select: { nis: true, user: { select: { name: true } } },
        },
        schedule: {
          select: {
            startTime: true,
            endTime: true,
            subject: { select: { name: true } },
            schoolClass: { select: { name: true } },
          },
        },
      },
      orderBy: [{ schedule: { startTime: "asc" } }, { student: { nis: "asc" } }],
      take: RECORD_LIMIT,
    }),
    prisma.studentAttendance.groupBy({
      by: ["status"],
      where: dayScope,
      _count: { _all: true },
    }),
    prisma.schoolClass.findMany({
      select: { id: true, name: true, academicYear: true },
      orderBy: [{ academicYear: "desc" }, { gradeLevel: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Absensi ${ENTITY_LABELS.STUDENT}`}
        description="Rekap kehadiran harian per kelas — koreksi status atau hapus catatan yang salah"
      />

      <StudentAttendanceFilters
        date={date}
        classId={classId}
        status={status}
        classOptions={classList.map((schoolClass) => ({
          id: schoolClass.id,
          // The same class name recurs every year, so the year disambiguates.
          name: `${schoolClass.name} (${schoolClass.academicYear})`,
        }))}
      />

      <StudentAttendanceSummary
        counts={Object.fromEntries(
          statusGroups.map((group) => [group.status, group._count._all]),
        )}
        activeStatus={status}
      />

      <StudentAttendanceTable
        records={records.map((record) => ({
          id: record.id,
          studentName: record.student.user.name,
          nis: record.student.nis,
          className: record.schedule.schoolClass.name,
          time: `${record.schedule.startTime}–${record.schedule.endTime}`,
          subjectName: record.schedule.subject.name,
          status: record.status,
          method: record.method,
          note: record.note,
          needsReview: record.needsReview,
        }))}
        truncated={records.length === RECORD_LIMIT}
      />
    </div>
  );
}
