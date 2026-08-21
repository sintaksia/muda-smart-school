"use client";

import { useState } from "react";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { EMPLOYMENT_STATUS_LABELS, ENTITY_LABELS } from "@/src/lib/constants";
import { TeacherForm } from "./TeacherForm";

export interface TeacherRow {
  id: string;
  name: string;
  email: string;
  nip: string | null;
  employmentStatus: string;
  subjects: string[];
  homeroomClasses: string[];
}

interface TeacherManagerProps {
  teacherList: TeacherRow[];
  subjectOptions: { id: string; name: string }[];
}

export function TeacherManager({
  teacherList,
  subjectOptions,
}: TeacherManagerProps) {
  const [formOpen, setFormOpen] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateButton
          label={`Tambah ${ENTITY_LABELS.TEACHER}`}
          onClick={() => setFormOpen(true)}
        />
      </div>

      <TeacherForm
        open={formOpen}
        onOpenChange={setFormOpen}
        subjectOptions={subjectOptions}
      />

      <section className="border-border rounded-md border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs font-semibold uppercase tracking-wide">
                <th className="px-5 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Mapel</th>
                <th className="px-4 py-3">Wali Kelas</th>
              </tr>
            </thead>
            <tbody>
              {teacherList.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="border-border border-b last:border-b-0"
                >
                  <td className="px-5 py-3">
                    <p className="text-foreground font-semibold">
                      {teacher.name}
                    </p>
                    {teacher.nip && (
                      <p className="text-muted-foreground text-xs tabular-nums">
                        NIP {teacher.nip}
                      </p>
                    )}
                  </td>
                  <td className="text-neutral-600 px-4 py-3">
                    {teacher.email}
                  </td>
                  <td className="text-neutral-600 px-4 py-3">
                    {EMPLOYMENT_STATUS_LABELS[teacher.employmentStatus]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-64 flex-wrap gap-1">
                      {teacher.subjects.length > 0 ? (
                        teacher.subjects.map((name) => (
                          <span
                            key={name}
                            className="bg-primary-50 text-primary-900 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          >
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="text-yellow-600 text-xs font-semibold">
                          Belum ada kualifikasi
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-neutral-600 px-4 py-3">
                    {teacher.homeroomClasses.join(", ") || "—"}
                  </td>
                </tr>
              ))}
              {teacherList.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground px-5 py-12 text-center"
                  >
                    Belum ada guru. Tambahkan akun guru pertama.
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
