import { Badge } from "@/src/app/admin/_components/Badge";
import {
  ATTENDANCE_STATUS_BADGES,
  ATTENDANCE_STATUS_LABELS,
} from "@/src/lib/constants";

interface AttendanceRecord {
  id: string;
  tanggal: string;
  mapel: string;
  status: string;
}

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
}

export function AttendanceHistory({ records }: AttendanceHistoryProps) {
  return (
    <section className="border-border rounded-md border bg-white">
      <header className="border-border border-b px-5 py-4">
        <h3 className="text-foreground text-base font-semibold">
          Riwayat Presensi
        </h3>
      </header>
      <ul>
        {records.map((record) => (
          <li
            key={record.id}
            className="border-border flex items-center justify-between border-b px-5 py-3 last:border-b-0"
          >
            <div>
              <p className="text-foreground text-sm font-semibold">
                {record.mapel}
              </p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {record.tanggal}
              </p>
            </div>
            <Badge variant={ATTENDANCE_STATUS_BADGES[record.status]}>
              {ATTENDANCE_STATUS_LABELS[record.status]}
            </Badge>
          </li>
        ))}
        {records.length === 0 && (
          <li className="text-muted-foreground px-5 py-8 text-center text-sm">
            Belum ada riwayat presensi.
          </li>
        )}
      </ul>
    </section>
  );
}
