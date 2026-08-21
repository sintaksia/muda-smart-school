"use client";

import { useMemo, useState } from "react";
import { Download, FileUp, UserRoundPlus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { DataTable } from "@/src/app/admin/_components/DataTable";
import { downloadStudentExport } from "@/src/features/master/utils/studentExcel";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { ImportStudentDialog } from "./ImportStudentDialog";
import { RegistrationIntakeDialog } from "./RegistrationIntakeDialog";
import { StudentFilters, type StudentFilterState } from "./StudentFilters";
import { StudentForm } from "./StudentForm";
import { studentColumns } from "./StudentColumns";
import type { StudentRow } from "@/src/features/master/types";

interface StudentManagerProps {
  students: StudentRow[];
  classOptions: { id: string; name: string }[];
  /** Accepted registrations still waiting to be turned into students. */
  pendingIntakeCount: number;
}

const emptyFilters: StudentFilterState = {
  classId: "",
  status: "",
  specialization: "",
};

export function StudentManager({
  students,
  classOptions,
  pendingIntakeCount,
}: StudentManagerProps) {
  const [filters, setFilters] = useState<StudentFilterState>(emptyFilters);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [importOpen, setImportOpen] = useState<boolean>(false);
  const [intakeOpen, setIntakeOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<StudentRow | null>(null);

  const visibleStudents = useMemo(
    () =>
      students.filter((student) => {
        if (filters.classId === "UNASSIGNED" && student.classId) return false;
        if (
          filters.classId &&
          filters.classId !== "UNASSIGNED" &&
          student.classId !== filters.classId
        ) {
          return false;
        }
        if (filters.status && student.status !== filters.status) return false;
        if (
          filters.specialization &&
          student.specialization !== filters.specialization
        ) {
          return false;
        }
        return true;
      }),
    [students, filters],
  );

  const columns = useMemo(
    () =>
      studentColumns({
        onEdit: (student) => {
          setEditing(student);
          setFormOpen(true);
        },
      }),
    [],
  );

  function openCreateForm(): void {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StudentFilters
          value={filters}
          onChange={setFilters}
          classOptions={classOptions}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => downloadStudentExport(visibleStudents)}
            disabled={visibleStudents.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            Impor
          </Button>
          <Button
            variant="outline"
            onClick={() => setIntakeOpen(true)}
            disabled={pendingIntakeCount === 0}
          >
            <UserRoundPlus className="mr-2 h-4 w-4" />
            Tarik dari Pendaftaran
            {pendingIntakeCount > 0 && ` (${pendingIntakeCount})`}
          </Button>
          <CreateButton
            label={`Tambah ${ENTITY_LABELS.STUDENT}`}
            onClick={openCreateForm}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={visibleStudents}
        searchPlaceholder="Cari nama atau NIS..."
        emptyMessage={
          students.length === 0
            ? "Belum ada siswa. Tambahkan manual, impor dari Excel, atau buat dari menu Pendaftaran."
            : "Tidak ada siswa yang cocok dengan filter."
        }
        pageSize={20}
      />

      <StudentForm
        key={editing?.id ?? "create"}
        open={formOpen}
        onOpenChange={setFormOpen}
        student={editing}
        classOptions={classOptions}
      />

      <ImportStudentDialog open={importOpen} onOpenChange={setImportOpen} />

      <RegistrationIntakeDialog
        key={pendingIntakeCount}
        open={intakeOpen}
        onOpenChange={setIntakeOpen}
        pendingCount={pendingIntakeCount}
      />
    </div>
  );
}
