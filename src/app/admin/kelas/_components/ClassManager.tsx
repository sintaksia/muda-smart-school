"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { apiRequest } from "@/src/lib/apiRequest";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { ClassAcademicYearFilter } from "./ClassAcademicYearFilter";
import { ClassForm } from "./ClassForm";
import { ClassTable } from "./ClassTable";

export interface ClassRow {
  id: string;
  name: string;
  gradeLevel: number;
  specialization: string;
  academicYear: string;
  homeroomTeacherId: string | null;
  homeroomTeacher: string | null;
  studentCount: number;
}

interface ClassManagerProps {
  classList: ClassRow[];
  teacherOptions: { id: string; name: string }[];
  /** Preselected in the filter, so the table opens on the year in progress. */
  activeAcademicYear: string;
}

export function ClassManager({
  classList,
  teacherOptions,
  activeAcademicYear,
}: ClassManagerProps) {
  const router = useRouter();
  const [yearFilter, setYearFilter] = useState<string>(activeAcademicYear);
  const [formOpen, setFormOpen] = useState<boolean>(false);

  const academicYears = useMemo(
    () =>
      Array.from(new Set(classList.map((row) => row.academicYear))).sort(
        (a, b) => b.localeCompare(a),
      ),
    [classList],
  );

  const visibleClasses = useMemo(
    () =>
      yearFilter
        ? classList.filter((row) => row.academicYear === yearFilter)
        : classList,
    [classList, yearFilter],
  );

  async function changeHomeroomTeacher(
    row: ClassRow,
    newTeacherId: string,
  ): Promise<void> {
    try {
      await apiRequest(`/api/master/classes/${row.id}`, "PUT", {
        name: row.name,
        gradeLevel: row.gradeLevel,
        specialization: row.specialization,
        academicYear: row.academicYear,
        homeroomTeacherId: newTeacherId || null,
      });
      toast.success(`Wali ${ENTITY_LABELS.CLASS.toLowerCase()} diperbarui`);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm(`Hapus ${ENTITY_LABELS.CLASS.toLowerCase()} ini?`)) {
      return;
    }
    try {
      await apiRequest(`/api/master/classes/${id}`, "DELETE");
      toast.success(`${ENTITY_LABELS.CLASS} dihapus`);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ClassAcademicYearFilter
          value={yearFilter}
          onChange={setYearFilter}
          academicYears={academicYears}
          totalShown={visibleClasses.length}
        />
        <CreateButton
          label={`Tambah ${ENTITY_LABELS.CLASS}`}
          onClick={() => setFormOpen(true)}
        />
      </div>

      <ClassTable
        rows={visibleClasses}
        teacherOptions={teacherOptions}
        onChangeHomeroomTeacher={changeHomeroomTeacher}
        onDelete={handleDelete}
        emptyMessage={
          classList.length === 0
            ? `Belum ada ${ENTITY_LABELS.CLASS.toLowerCase()}.`
            : `Tidak ada ${ENTITY_LABELS.CLASS.toLowerCase()} pada tahun ajaran ini.`
        }
      />

      <ClassForm
        key={yearFilter}
        open={formOpen}
        onOpenChange={setFormOpen}
        teacherOptions={teacherOptions}
        defaultAcademicYear={yearFilter || activeAcademicYear}
      />
    </div>
  );
}
