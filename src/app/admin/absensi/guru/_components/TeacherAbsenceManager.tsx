"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { apiRequest } from "@/src/lib/apiRequest";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { TeacherAbsenceForm } from "./TeacherAbsenceForm";
import { TeacherAbsenceTable } from "./TeacherAbsenceTable";

export interface TeacherAbsenceRow {
  id: string;
  teacherName: string;
  date: string;
  status: string;
  className: string;
  subjectName: string;
  time: string;
  substitute: string | null;
}

interface TeacherAbsenceManagerProps {
  records: TeacherAbsenceRow[];
  teacherOptions: { id: string; name: string }[];
}

export function TeacherAbsenceManager({
  records,
  teacherOptions,
}: TeacherAbsenceManagerProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);

  async function assignSubstitute(
    recordId: string,
    substituteTeacherId: string,
  ): Promise<void> {
    if (!substituteTeacherId) {
      return;
    }
    setBusyId(recordId);
    try {
      await apiRequest(
        `/api/attendance/teacher-absence/${recordId}`,
        "PATCH",
        { substituteTeacherId },
        "Gagal menugaskan pengganti",
      );
      toast.success(`${ENTITY_LABELS.TEACHER} pengganti ditugaskan`);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateButton
          label="Catat Ketidakhadiran"
          onClick={() => setFormOpen(true)}
        />
      </div>

      <TeacherAbsenceTable
        records={records}
        teacherOptions={teacherOptions}
        busyId={busyId}
        onAssignSubstitute={assignSubstitute}
      />

      <TeacherAbsenceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        teacherOptions={teacherOptions}
      />
    </div>
  );
}
