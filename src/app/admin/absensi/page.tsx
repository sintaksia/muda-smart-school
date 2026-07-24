import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../_components/PageHeader";
import { Badge } from "../_components/Badge";
import { dateOnlyUtc, toWibParts } from "@/src/features/attendance/utils/time";
import {
  HARI_LABELS,
  SESI_STATUS_BADGES,
  SESI_STATUS_LABELS,
} from "@/src/lib/constants";

export const dynamic = "force-dynamic";

export default async function AbsensiMonitorPage() {
  const { dateISO, hari } = toWibParts(new Date());

  const jadwal = hari
    ? await prisma.jadwal.findMany({
        where: { hari, isActive: true },
        include: {
          kelas: { select: { name: true } },
          mataPelajaran: { select: { name: true } },
          guru: { select: { user: { select: { name: true } } } },
          sesi: {
            where: { tanggal: dateOnlyUtc(dateISO) },
            include: { absensiSiswa: { select: { status: true } } },
          },
        },
        orderBy: { jamMulai: "asc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sesi Hari Ini"
        description={`Pemantauan sesi kelas ${hari ? HARI_LABELS[hari] : "Minggu"}, ${dateISO}`}
      />

      <section className="border-hairline rounded-card border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-hairline text-ink-muted border-b text-left text-xs font-semibold uppercase tracking-wide">
                <th className="px-5 py-3">Jam</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Mapel</th>
                <th className="px-4 py-3">Guru</th>
                <th className="px-4 py-3">Status Sesi</th>
                <th className="px-4 py-3 text-right">Hadir</th>
              </tr>
            </thead>
            <tbody>
              {jadwal.map((row) => {
                const sesi = row.sesi[0];
                const hadir = sesi?.absensiSiswa.filter(
                  (a) => a.status === "HADIR" || a.status === "TERLAMBAT",
                ).length;
                return (
                  <tr
                    key={row.id}
                    className="border-hairline border-b last:border-b-0"
                  >
                    <td className="text-ink px-5 py-3 font-semibold tabular-nums">
                      {row.jamMulai}–{row.jamSelesai}
                    </td>
                    <td className="text-ink px-4 py-3">{row.kelas.name}</td>
                    <td className="text-ink-secondary px-4 py-3">
                      {row.mataPelajaran.name}
                    </td>
                    <td className="text-ink-secondary px-4 py-3">
                      {row.guru.user.name}
                    </td>
                    <td className="px-4 py-3">
                      {sesi ? (
                        <Badge variant={SESI_STATUS_BADGES[sesi.status]}>
                          {SESI_STATUS_LABELS[sesi.status]}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Belum dibuka</Badge>
                      )}
                    </td>
                    <td className="text-ink px-4 py-3 text-right font-semibold tabular-nums">
                      {sesi ? (hadir ?? 0) : "—"}
                    </td>
                  </tr>
                );
              })}
              {jadwal.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-ink-muted px-5 py-12 text-center"
                  >
                    Tidak ada jadwal untuk hari ini.
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
