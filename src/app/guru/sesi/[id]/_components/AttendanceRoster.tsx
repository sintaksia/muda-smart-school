"use client";

import { toast } from "sonner";
import { MapPinOff } from "lucide-react";
import { Badge } from "@/src/app/admin/_components/Badge";
import { Button } from "@/src/components/ui/button";
import { SelectField } from "@/src/components/common/SelectField";
import {
  ATTENDANCE_STATUS_BADGES,
  ATTENDANCE_STATUS_LABELS,
  manualAttendanceStatusOptions,
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
    <section className="border-border rounded-md border bg-white">
      <header className="border-border flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-foreground text-base font-semibold">
          Daftar Siswa
        </h3>
        <span className="text-muted-foreground text-xs font-medium tabular-nums">
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
              className={`border-border flex items-center justify-between border-b px-5 py-3 last:border-b-0 ${
                record?.needsReview ? "bg-yellow-600/10" : ""
              }`}
            >
              <div>
                <p className="text-foreground text-sm font-semibold">
                  {student.user.name}
                </p>
                <p className="text-muted-foreground text-xs tabular-nums">
                  {student.nis}
                  {record?.scanTime &&
                    ` · scan ${new Date(record.scanTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {record?.needsReview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmGps(record.id)}
                    className="text-yellow-600 h-auto gap-1 px-1 py-0 text-xs font-semibold hover:bg-transparent hover:opacity-80"
                    title="GPS di luar radius — klik untuk konfirmasi"
                  >
                    <MapPinOff className="h-4 w-4" strokeWidth={1.75} />
                    Konfirmasi
                  </Button>
                )}
                {record ? (
                  <Badge variant={ATTENDANCE_STATUS_BADGES[record.status]}>
                    {ATTENDANCE_STATUS_LABELS[record.status]}
                  </Badge>
                ) : isOpen ? (
                  <SelectField
                    ariaLabel="Tandai kehadiran"
                    placeholder="Tandai…"
                    value=""
                    onChange={(next) => void markManual(student.id, next)}
                    className="h-8 w-32 text-xs"
                    options={manualAttendanceStatusOptions.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                  />
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
