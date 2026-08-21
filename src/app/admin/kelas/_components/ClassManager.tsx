"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { DeleteRowButton } from "@/src/app/admin/_components/DeleteRowButton";
import { ClassAcademicYearFilter } from "./ClassAcademicYearFilter";
import { SelectField } from "@/src/components/common/SelectField";
import {
  ADMIN_FIELD_CLASS,
  FILTER_FIELD_CLASS,
} from "@/src/components/common/formClasses";
import {
  gradeLevelOptions,
  SPECIALIZATION_SHORT_LABELS,
  specializationOptions,
} from "@/src/lib/constants";

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

  const academicYears = useMemo(
    () =>
      Array.from(new Set(classList.map((row) => row.academicYear))).sort((a, b) =>
        b.localeCompare(a),
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
  const currentYear = new Date().getFullYear();
  const [name, setName] = useState<string>("");
  const [gradeLevel, setGradeLevel] = useState<string>("10");
  const [specialization, setSpecialization] = useState<string>(
    specializationOptions[0].value,
  );
  const [academicYear, setAcademicYear] = useState<string>(
    `${currentYear}/${currentYear + 1}`,
  );
  const [homeroomTeacherId, setHomeroomTeacherId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function request(
    url: string,
    method: string,
    body?: unknown,
  ): Promise<boolean> {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const data = await response.json();
      toast.error(data.error ?? "Terjadi kesalahan");
      return false;
    }
    router.refresh();
    return true;
  }

  async function handleCreate(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    const ok = await request("/api/master/classes", "POST", {
      name,
      gradeLevel: Number(gradeLevel),
      specialization,
      academicYear,
      homeroomTeacherId: homeroomTeacherId || null,
    });
    if (ok) {
      toast.success("Kelas dibuat");
      setName("");
    }
    setSubmitting(false);
  }

  async function changeWali(row: ClassRow, newWaliId: string): Promise<void> {
    const ok = await request(`/api/master/classes/${row.id}`, "PUT", {
      name: row.name,
      gradeLevel: row.gradeLevel,
      specialization: row.specialization,
      academicYear: row.academicYear,
      homeroomTeacherId: newWaliId || null,
    });
    if (ok) {
      toast.success("Wali kelas diperbarui");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm("Hapus kelas ini?")) {
      return;
    }
    const ok = await request(`/api/master/classes/${id}`, "DELETE");
    if (ok) {
      toast.success("Kelas dihapus");
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="border-border rounded-md border bg-white p-5"
      >
        <h3 className="text-foreground mb-4 text-base font-semibold">
          Tambah Kelas
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama (mis. X PPLG 1)"
            required
            minLength={2}
            className={ADMIN_FIELD_CLASS}
          />
          <SelectField
            ariaLabel="Tingkat"
            value={gradeLevel}
            onChange={setGradeLevel}
            className={ADMIN_FIELD_CLASS}
            options={gradeLevelOptions.map((option) => ({
              value: String(option.value),
              label: option.label,
            }))}
          />
          <SelectField
            ariaLabel="Program Keahlian"
            value={specialization}
            onChange={setSpecialization}
            className={ADMIN_FIELD_CLASS}
            options={specializationOptions.map((option) => ({
              value: option.value,
              label: option.short,
            }))}
          />
          <Input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="2026/2027"
            pattern="\d{4}/\d{4}"
            required
            className={`${ADMIN_FIELD_CLASS} tabular-nums`}
          />
          <SelectField
            searchable
            ariaLabel="Wali Kelas"
            value={homeroomTeacherId}
            onChange={setHomeroomTeacherId}
            className={ADMIN_FIELD_CLASS}
            emptyLabel="Wali kelas (opsional)"
            options={teacherOptions.map((teacher) => ({
              value: teacher.id,
              label: teacher.name,
            }))}
          />
          <Button type="submit" disabled={submitting} className="h-11">
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>

      <ClassAcademicYearFilter
        value={yearFilter}
        onChange={setYearFilter}
        academicYears={academicYears}
        totalShown={visibleClasses.length}
      />

      <section className="border-border rounded-md border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs font-semibold uppercase tracking-wide">
                <th className="px-5 py-3">Kelas</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Tahun Ajaran</th>
                <th className="px-4 py-3">Wali Kelas</th>
                <th className="px-4 py-3 text-right">Siswa</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visibleClasses.map((row) => (
                <tr
                  key={row.id}
                  className="border-border border-b last:border-b-0"
                >
                  <td className="text-foreground px-5 py-3 font-semibold">
                    {row.name}
                  </td>
                  <td className="text-neutral-600 px-4 py-3">
                    {SPECIALIZATION_SHORT_LABELS[row.specialization]}
                  </td>
                  <td className="text-neutral-600 px-4 py-3 tabular-nums">
                    {row.academicYear}
                  </td>
                  <td className="px-4 py-3">
                    <SelectField
                      searchable
                      ariaLabel="Wali Kelas"
                      value={row.homeroomTeacherId ?? ""}
                      onChange={(next) => changeWali(row, next)}
                      className={FILTER_FIELD_CLASS}
                      emptyLabel="— Belum ada —"
                      options={teacherOptions.map((teacher) => ({
                        value: teacher.id,
                        label: teacher.name,
                      }))}
                    />
                  </td>
                  <td className="text-foreground px-4 py-3 text-right font-semibold tabular-nums">
                    {row.studentCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteRowButton
                      onClick={() => handleDelete(row.id)}
                      label="Hapus kelas"
                    />
                  </td>
                </tr>
              ))}
              {visibleClasses.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-muted-foreground px-5 py-12 text-center"
                  >
                    {classList.length === 0
                      ? "Belum ada kelas."
                      : "Tidak ada kelas pada tahun ajaran ini."}
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
