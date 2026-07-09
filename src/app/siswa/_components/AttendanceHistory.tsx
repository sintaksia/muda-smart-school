import { Badge } from "@/src/app/admin/_components/Badge";
import {
  ABSENSI_STATUS_BADGES,
  ABSENSI_STATUS_LABELS,
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
    <section className="border-hairline rounded-card border bg-white">
      <header className="border-hairline border-b px-5 py-4">
        <h3 className="text-ink text-base font-semibold">Riwayat Presensi</h3>
      </header>
      <ul>
        {records.map((record) => (
          <li
            key={record.id}
            className="border-hairline flex items-center justify-between border-b px-5 py-3 last:border-b-0"
          >
            <div>
              <p className="text-ink text-sm font-semibold">{record.mapel}</p>
              <p className="text-ink-muted text-xs tabular-nums">
                {record.tanggal}
              </p>
            </div>
            <Badge variant={ABSENSI_STATUS_BADGES[record.status]}>
              {ABSENSI_STATUS_LABELS[record.status]}
            </Badge>
          </li>
        ))}
        {records.length === 0 && (
          <li className="text-ink-muted px-5 py-8 text-center text-sm">
            Belum ada riwayat presensi.
          </li>
        )}
      </ul>
    </section>
  );
}
