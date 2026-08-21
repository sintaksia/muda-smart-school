import { AlertTriangle } from "lucide-react";
import { ENTITY_LABELS } from "@/src/lib/constants";

interface PromotionUnplacedNoticeProps {
  students: { studentId: string; name: string; nis: string }[];
}

/**
 * Active students with no class sit outside the promotion entirely. Saying so
 * up front is the difference between "handled" and "quietly skipped".
 */
export function PromotionUnplacedNotice({
  students,
}: PromotionUnplacedNoticeProps) {
  return (
    <section className="border-border rounded-md border bg-white p-5">
      <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
        <AlertTriangle className="text-yellow-600 h-4 w-4" />
        {students.length} siswa aktif belum ditempatkan di{" "}
        {ENTITY_LABELS.CLASS.toLowerCase()}
      </h3>
      <p className="text-muted-foreground mt-1 text-xs">
        Mereka tidak ikut proses kenaikan. Tempatkan dulu lewat halaman{" "}
        {ENTITY_LABELS.STUDENT} bila seharusnya naik kelas.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {students.map((student) => (
          <li
            key={student.studentId}
            className="border-border rounded-sm border px-2 py-1 text-xs text-neutral-600"
          >
            {student.name}{" "}
            <span className="tabular-nums text-neutral-500">{student.nis}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
