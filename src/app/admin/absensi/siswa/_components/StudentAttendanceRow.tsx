"use client";

import { MapPinOff, Trash2 } from "lucide-react";
import { Badge } from "@/src/app/admin/_components/Badge";
import { Button } from "@/src/components/ui/button";
import { SelectField } from "@/src/components/common/SelectField";
import {
  ATTENDANCE_METHOD_LABELS,
  ATTENDANCE_STATUS_BADGES,
  ATTENDANCE_STATUS_LABELS,
  attendanceStatusOptions,
} from "@/src/lib/constants";

export interface StudentAttendanceRecord {
  id: string;
  studentName: string;
  nis: string;
  className: string;
  time: string;
  subjectName: string;
  status: string;
  method: string;
  note: string | null;
  needsReview: boolean;
}

interface StudentAttendanceRowProps {
  record: StudentAttendanceRecord;
  busy: boolean;
  onOverride: (recordId: string, status: string) => void;
  onConfirmGps: (recordId: string) => void;
  onRequestDelete: (record: StudentAttendanceRecord) => void;
}

export function StudentAttendanceRow({
  record,
  busy,
  onOverride,
  onConfirmGps,
  onRequestDelete,
}: StudentAttendanceRowProps) {
  return (
    <tr
      className={`border-border border-b last:border-b-0 ${
        record.needsReview ? "bg-yellow-600/10" : ""
      }`}
    >
      <td className="px-5 py-3">
        <p className="text-foreground font-semibold">{record.studentName}</p>
        <p className="text-muted-foreground text-xs tabular-nums">
          {record.nis}
        </p>
      </td>
      <td className="text-neutral-600 px-4 py-3">{record.className}</td>
      <td className="px-4 py-3">
        <p className="text-foreground tabular-nums">{record.time}</p>
        <p className="text-muted-foreground text-xs">{record.subjectName}</p>
      </td>
      <td className="px-4 py-3">
        <Badge variant={ATTENDANCE_STATUS_BADGES[record.status]}>
          {ATTENDANCE_STATUS_LABELS[record.status]}
        </Badge>
      </td>
      <td className="text-neutral-600 px-4 py-3 text-xs">
        {ATTENDANCE_METHOD_LABELS[record.method] ?? record.method}
        {record.note && (
          <span className="text-muted-foreground block max-w-48 truncate">
            {record.note}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {record.needsReview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => onConfirmGps(record.id)}
              className="text-yellow-600 hover:text-yellow-600 hover:bg-yellow-600/10 gap-1 px-2 text-xs font-semibold"
              title="GPS di luar radius — klik untuk konfirmasi"
            >
              <MapPinOff className="h-4 w-4" strokeWidth={1.75} />
              Konfirmasi
            </Button>
          )}
          <SelectField
            ariaLabel={`Ubah status ${record.studentName}`}
            placeholder="Ubah…"
            value=""
            disabled={busy}
            onChange={(next) => onOverride(record.id, next)}
            className="h-8 w-28 text-xs"
            options={attendanceStatusOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={busy}
            onClick={() => onRequestDelete(record)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
            title="Hapus catatan kehadiran"
            aria-label={`Hapus catatan kehadiran ${record.studentName}`}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
