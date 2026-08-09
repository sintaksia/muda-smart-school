"use client";

import { MapPinOff, Trash2 } from "lucide-react";
import { Badge } from "@/src/app/admin/_components/Badge";
import { Button } from "@/src/components/ui/button";
import { SelectField } from "@/src/components/common/SelectField";
import {
  ATTENDANCE_STATUS_BADGES,
  ATTENDANCE_STATUS_LABELS,
  manualAttendanceStatusOptions,
} from "@/src/lib/constants";
import type { SessionDetail } from "./AttendanceRoster";

type AttendanceRecord = SessionDetail["studentAttendance"][number];
type RosterStudent =
  SessionDetail["schedule"]["schoolClass"]["students"][number];

interface RosterRowProps {
  student: RosterStudent;
  record: AttendanceRecord | undefined;
  isOpen: boolean;
  onConfirmGps: (recordId: string) => void;
  onMarkManual: (studentId: string, status: string) => void;
  onRequestDelete: (record: AttendanceRecord, studentName: string) => void;
}

export function RosterRow({
  student,
  record,
  isOpen,
  onConfirmGps,
  onMarkManual,
  onRequestDelete,
}: RosterRowProps) {
  return (
    <li
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
            onClick={() => onConfirmGps(record.id)}
            className="text-yellow-600 h-auto gap-1 px-1 py-0 text-xs font-semibold hover:bg-transparent hover:opacity-80"
            title="GPS di luar radius — klik untuk konfirmasi"
          >
            <MapPinOff className="h-4 w-4" strokeWidth={1.75} />
            Konfirmasi
          </Button>
        )}
        {record ? (
          <>
            <Badge variant={ATTENDANCE_STATUS_BADGES[record.status]}>
              {ATTENDANCE_STATUS_LABELS[record.status]}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRequestDelete(record, student.user.name)}
              className="text-destructive h-auto px-1 py-0 hover:bg-transparent hover:opacity-80"
              title="Hapus presensi (salah scan)"
              aria-label={`Hapus presensi ${student.user.name}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </>
        ) : isOpen ? (
          <SelectField
            ariaLabel="Tandai kehadiran"
            placeholder="Tandai…"
            value=""
            onChange={(next) => onMarkManual(student.id, next)}
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
}
