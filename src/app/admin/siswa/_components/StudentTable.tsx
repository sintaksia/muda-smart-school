"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  SPECIALIZATION_SHORT_LABELS,
  STUDENT_STATUS_BADGES,
  STUDENT_STATUS_LABELS,
  studentStatusOptions,
} from "@/src/lib/constants";

export interface StudentRow {
  id: string;
  name: string;
  nis: string;
  specialization: string;
  angkatan: number;
  classId: string | null;
  status: string;
}

interface StudentTableProps {
  studentList: StudentRow[];
  classOptions: { id: string; name: string }[];
}

export function StudentTable({ studentList, classOptions }: StudentTableProps) {
  const router = useRouter();

  async function patch(
    id: string,
    body: { classId?: string | null; status?: string },
    successMessage: string,
  ): Promise<void> {
    const response = await fetch(`/api/master/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      toast.success(successMessage);
      router.refresh();
    } else {
      const data = await response.json();
      toast.error(data.error ?? "Gagal memperbarui siswa");
    }
  }

  return (
    <section className="border-hairline rounded-card border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-hairline text-ink-muted border-b text-left text-xs font-semibold uppercase tracking-wide">
              <th className="px-5 py-3">Siswa</th>
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3">Angkatan</th>
              <th className="px-4 py-3">Kelas</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {studentList.map((student) => (
              <tr
                key={student.id}
                className="border-hairline border-b last:border-b-0"
              >
                <td className="px-5 py-3">
                  <p className="text-ink font-semibold">{student.name}</p>
                  <p className="text-ink-muted text-xs tabular-nums">
                    NIS {student.nis}
                  </p>
                </td>
                <td className="text-ink-secondary px-4 py-3">
                  {SPECIALIZATION_SHORT_LABELS[student.specialization]}
                </td>
                <td className="text-ink-secondary px-4 py-3 tabular-nums">
                  {student.angkatan}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={student.classId ?? ""}
                    onChange={(e) =>
                      patch(
                        student.id,
                        { classId: e.target.value || null },
                        "Kelas siswa diperbarui",
                      )
                    }
                    className="border-hairline-strong text-ink-secondary rounded-input h-9 border bg-white px-2 text-xs"
                  >
                    <option value="">— Belum ditempatkan —</option>
                    {classOptions.map((schoolClass) => (
                      <option key={schoolClass.id} value={schoolClass.id}>
                        {schoolClass.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={STUDENT_STATUS_BADGES[student.status]}>
                      {STUDENT_STATUS_LABELS[student.status]}
                    </Badge>
                    <select
                      value={student.status}
                      onChange={(e) =>
                        patch(
                          student.id,
                          { status: e.target.value },
                          "Status siswa diperbarui",
                        )
                      }
                      className="border-hairline-strong text-ink-secondary rounded-input h-9 border bg-white px-2 text-xs"
                    >
                      {studentStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {studentList.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-ink-muted px-5 py-12 text-center"
                >
                  Belum ada siswa. Akun siswa dibuat dari pendaftaran yang
                  diterima (menu Pendaftaran).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
