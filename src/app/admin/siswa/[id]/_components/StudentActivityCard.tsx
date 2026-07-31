import { Badge } from "@/src/app/admin/_components/Badge";
import {
  ATTENDANCE_STATUS_BADGES,
  ATTENDANCE_STATUS_LABELS,
} from "@/src/lib/constants";

export interface AttendanceCount {
  status: string;
  count: number;
}

interface StudentActivityCardProps {
  creditTotal: number;
  attendanceCounts: AttendanceCount[];
  leaveRequestCount: number;
}

/** Credit score, attendance tally and leave requests at a glance. */
export function StudentActivityCard({
  creditTotal,
  attendanceCounts,
  leaveRequestCount,
}: StudentActivityCardProps) {
  return (
    <section className="border-border rounded-md border bg-white">
      <h2 className="border-border text-foreground border-b px-5 py-3 text-sm font-semibold">
        Aktivitas
      </h2>
      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-muted-foreground text-xs font-semibold">
              Poin Kredit
            </p>
            <p className="text-foreground text-2xl font-bold tabular-nums">
              {creditTotal}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-semibold">
              Pengajuan Izin
            </p>
            <p className="text-foreground text-2xl font-bold tabular-nums">
              {leaveRequestCount}
            </p>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-2 text-xs font-semibold">
            Rekap Absensi
          </p>
          {attendanceCounts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Belum ada riwayat absensi.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {attendanceCounts.map((item) => (
                <Badge
                  key={item.status}
                  variant={ATTENDANCE_STATUS_BADGES[item.status]}
                >
                  {ATTENDANCE_STATUS_LABELS[item.status]}: {item.count}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
