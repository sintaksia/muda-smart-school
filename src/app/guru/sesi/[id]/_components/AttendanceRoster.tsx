"use client";

import { toast } from "sonner";
import { MapPinOff } from "lucide-react";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  ATTENDANCE_STATUS_BADGES,
  ATTENDANCE_STATUS_LABELS,
} from "@/src/lib/constants";

export interface SessionDetail {
  id: string;
  status: string;
  qrToken: string | null;
  jadwal: {
    startTime: string;
    endTime: string;
    kelas: {
      name: string;
      students: { id: string; nis: string; user: { name: string } }[];
    };
    mataPelajaran: { name: string };
  };
  studentAttendance: {
    id: string;
    studentId: string;
    status: string;
    needsReview: boolean;
    gpsValid: boolean | null;
    scanTime: string | null;
  }[];
}

interface AttendanceRosterProps {
  sesi: SessionDetail;
  onChanged: () => Promise<void>;
}

export function AttendanceRoster({ sesi, onChanged }: AttendanceRosterProps) {
  const recordByStudent = new Map(
    sesi.studentAttendance.map((record) => [record.studentId, record]),
  );
  const isOpen = sesi.status === "OPEN";

  async function confirmGps(recordId: string): Promise<void> {
    const response = await fetch(`/api/attendance/records/${recordId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearReview: true }),
    });
    if (response.ok) {
      toast.success("Presensi dikonfirmasi");
      await onChanged();
    } else {
      toast.error("Gagal mengonfirmasi presensi");
    }
  }

  async function markManual(studentId: string, status: string): Promise<void> {
    const response = await fetch(`/api/attendance/sessions/${sesi.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "manual-attendance", studentId, status }),
    });
    if (response.ok) {
      toast.success("Presensi manual tercatat");
      await onChanged();
    } else {
      const data = await response.json();
      toast.error(data.error ?? "Gagal mencatat presensi");
    }
  }

  return (
    <section className="border-hairline rounded-card border bg-white">
      <header className="border-hairline flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-ink text-base font-semibold">Daftar Siswa</h3>
        <span className="text-ink-muted text-xs font-medium tabular-nums">
          {sesi.studentAttendance.length}/{sesi.jadwal.kelas.students.length}{" "}
          tercatat
        </span>
      </header>
      <ul>
        {sesi.jadwal.kelas.students.map((student) => {
          const record = recordByStudent.get(student.id);
          return (
            <li
              key={student.id}
              className={`border-hairline flex items-center justify-between border-b px-5 py-3 last:border-b-0 ${
                record?.needsReview ? "bg-warning/10" : ""
              }`}
            >
              <div>
                <p className="text-ink text-sm font-semibold">
                  {student.user.name}
                </p>
                <p className="text-ink-muted text-xs tabular-nums">
                  {student.nis}
                  {record?.scanTime &&
                    ` · scan ${new Date(record.scanTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {record?.needsReview && (
                  <button
                    type="button"
                    onClick={() => confirmGps(record.id)}
                    className="text-warning inline-flex items-center gap-1 text-xs font-semibold hover:opacity-80"
                    title="GPS di luar radius — klik untuk konfirmasi"
                  >
                    <MapPinOff className="h-4 w-4" strokeWidth={1.75} />
                    Konfirmasi
                  </button>
                )}
                {record ? (
                  <Badge variant={ATTENDANCE_STATUS_BADGES[record.status]}>
                    {ATTENDANCE_STATUS_LABELS[record.status]}
                  </Badge>
                ) : isOpen ? (
                  <select
                    defaultValue=""
                    onChange={(event) => {
                      if (event.target.value) {
                        void markManual(student.id, event.target.value);
                      }
                    }}
                    className="border-hairline-strong text-ink-secondary rounded-input h-8 border bg-white px-2 text-xs"
                  >
                    <option value="" disabled>
                      Tandai…
                    </option>
                    <option value="PRESENT">Hadir</option>
                    <option value="EXCUSED">Izin</option>
                    <option value="SICK">Sakit</option>
                  </select>
                ) : (
                  <span className="text-ink-muted text-xs">—</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
