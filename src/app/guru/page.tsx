import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { dateOnlyUtc, toWibParts } from "@/src/features/attendance/utils/time";
import { HARI_LABELS } from "@/src/lib/constants";
import { SessionList } from "./_components/SessionList";

export const dynamic = "force-dynamic";

export default async function GuruDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const guru = await prisma.guru.findUnique({ where: { userId: user.id } });
  if (!guru) {
    redirect("/login");
  }

  const { dateISO, hari } = toWibParts(new Date());
  const jadwal = hari
    ? await prisma.jadwal.findMany({
        where: { hari, isActive: true, guruId: guru.id },
        include: {
          kelas: { select: { nama: true } },
          mataPelajaran: { select: { nama: true } },
          sesi: { where: { tanggal: dateOnlyUtc(dateISO) } },
        },
        orderBy: { jamMulai: "asc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ink text-[28px] font-bold tracking-tight">
          Sesi Mengajar Hari Ini
        </h1>
        <p className="text-ink-secondary mt-1 text-sm">
          {hari ? HARI_LABELS[hari] : "Minggu"}, {dateISO}
        </p>
      </div>
      <SessionList
        items={jadwal.map((row) => ({
          jadwalId: row.id,
          jam: `${row.jamMulai}–${row.jamSelesai}`,
          kelas: row.kelas.nama,
          mapel: row.mataPelajaran.nama,
          sesiId: row.sesi[0]?.id ?? null,
          sesiStatus: row.sesi[0]?.status ?? null,
        }))}
      />
    </div>
  );
}
