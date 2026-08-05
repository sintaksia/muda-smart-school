import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { getCreditTotal } from "@/src/features/attendance/services/credit";
import { ProfileNotLinkedNotice } from "@/src/components/common/ProfileNotLinkedNotice";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { ScanCard } from "./_components/ScanCard";
import { CreditSummaryCard } from "./_components/CreditSummaryCard";
import { AttendanceHistory } from "./_components/AttendanceHistory";
import { IzinSection } from "./_components/IzinSection";

export const dynamic = "force-dynamic";

export default async function SiswaDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
  });
  if (!student) {
    return (
      <ProfileNotLinkedNotice
        entityLabel={ENTITY_LABELS.STUDENT}
        email={user.email}
      />
    );
  }

  const [total, history, izinList] = await Promise.all([
    getCreditTotal("STUDENT", student.id),
    prisma.studentAttendance.findMany({
      where: { studentId: student.id },
      include: {
        schedule: { select: { subject: { select: { name: true } } } },
      },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.leaveRequest.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      <CreditSummaryCard total={total} name={user.name} />
      <ScanCard />
      <IzinSection
        submissions={izinList.map((izin) => ({
          id: izin.id,
          jenis: izin.type,
          tanggal: izin.date.toISOString().slice(0, 10),
          alasan: izin.reason,
          status: izin.status,
        }))}
      />
      <AttendanceHistory
        records={history.map((record) => ({
          id: record.id,
          tanggal: record.date.toISOString().slice(0, 10),
          mapel: record.schedule.subject.name,
          status: record.status,
        }))}
      />
    </div>
  );
}
