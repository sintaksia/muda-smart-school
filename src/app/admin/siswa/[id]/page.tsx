import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/src/app/admin/_components/Badge";
import { PageHeader } from "../../_components/PageHeader";
import { getStudentById } from "@/src/features/master/services/student";
import { toStudentRow } from "@/src/features/master/utils/studentRow";
import { getCreditTotal } from "@/src/features/attendance/services/credit";
import { prisma } from "@/src/lib/prisma";
import {
  ENTITY_LABELS,
  GENDER_LABELS,
  SPECIALIZATION_LABELS,
  STUDENT_STATUS_BADGES,
  STUDENT_STATUS_LABELS,
} from "@/src/lib/constants";
import { STUDENT_SHEET_COLUMNS } from "@/src/features/master/constants";
import { StudentActivityCard } from "./_components/StudentActivityCard";
import { StudentInfoCard } from "./_components/StudentInfoCard";

export const dynamic = "force-dynamic";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const { id } = await params;
  const record = await getStudentById(id);
  if (!record) {
    notFound();
  }

  const student = toStudentRow(record);
  const [creditTotal, attendanceGroups, leaveRequestCount] = await Promise.all([
    getCreditTotal("STUDENT", student.id),
    prisma.studentAttendance.groupBy({
      by: ["status"],
      where: { studentId: student.id },
      _count: { _all: true },
    }),
    prisma.leaveRequest.count({ where: { studentId: student.id } }),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/siswa"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar {ENTITY_LABELS.STUDENT}
      </Link>

      <PageHeader
        title={student.name}
        description={`NIS ${student.nis} · ${SPECIALIZATION_LABELS[student.specialization]}`}
        action={
          <Badge variant={STUDENT_STATUS_BADGES[student.status]}>
            {STUDENT_STATUS_LABELS[student.status]}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentInfoCard
          title="Akun"
          items={[
            { label: STUDENT_SHEET_COLUMNS.name, value: student.name },
            { label: STUDENT_SHEET_COLUMNS.email, value: student.email },
            { label: STUDENT_SHEET_COLUMNS.phone, value: student.phone },
          ]}
        />
        <StudentInfoCard
          title="Data Akademik"
          items={[
            { label: STUDENT_SHEET_COLUMNS.nis, value: student.nis },
            { label: STUDENT_SHEET_COLUMNS.nisn, value: student.nisn },
            {
              label: STUDENT_SHEET_COLUMNS.specialization,
              value: SPECIALIZATION_LABELS[student.specialization],
            },
            { label: STUDENT_SHEET_COLUMNS.angkatan, value: student.angkatan },
            { label: ENTITY_LABELS.CLASS, value: student.className },
            {
              label: STUDENT_SHEET_COLUMNS.previousSchoolName,
              value: student.previousSchoolName,
            },
          ]}
        />
        <StudentInfoCard
          title="Biodata"
          items={[
            {
              label: STUDENT_SHEET_COLUMNS.gender,
              value: student.gender ? GENDER_LABELS[student.gender] : null,
            },
            { label: STUDENT_SHEET_COLUMNS.nik, value: student.nik },
            {
              label: STUDENT_SHEET_COLUMNS.birthPlace,
              value: student.birthPlace,
            },
            {
              label: STUDENT_SHEET_COLUMNS.birthDate,
              value: student.birthDate,
            },
            {
              label: STUDENT_SHEET_COLUMNS.streetAddress,
              value: student.streetAddress,
            },
            { label: STUDENT_SHEET_COLUMNS.village, value: student.village },
            { label: STUDENT_SHEET_COLUMNS.district, value: student.district },
            { label: STUDENT_SHEET_COLUMNS.city, value: student.city },
            { label: STUDENT_SHEET_COLUMNS.province, value: student.province },
          ]}
        />
        <StudentInfoCard
          title="Orang Tua / Wali"
          items={[
            {
              label: STUDENT_SHEET_COLUMNS.fatherName,
              value: student.fatherName,
            },
            {
              label: STUDENT_SHEET_COLUMNS.motherName,
              value: student.motherName,
            },
            {
              label: STUDENT_SHEET_COLUMNS.guardianName,
              value: student.guardianName,
            },
            {
              label: STUDENT_SHEET_COLUMNS.parentPhone,
              value: student.parentPhone,
            },
          ]}
        />
      </div>

      <StudentActivityCard
        creditTotal={creditTotal}
        attendanceCounts={attendanceGroups.map((group) => ({
          status: group.status,
          count: group._count._all,
        }))}
        leaveRequestCount={leaveRequestCount}
      />
    </div>
  );
}
