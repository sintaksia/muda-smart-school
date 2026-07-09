import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../../_components/PageHeader";
import { TeacherAbsenceManager } from "./_components/TeacherAbsenceManager";

export const dynamic = "force-dynamic";

export default async function TeacherAbsencePage() {
  const [records, guruList] = await Promise.all([
    prisma.absensiGuru.findMany({
      include: {
        guru: { select: { user: { select: { name: true } } } },
        substituteGuru: { select: { user: { select: { name: true } } } },
        jadwal: {
          select: {
            jamMulai: true,
            jamSelesai: true,
            kelas: { select: { nama: true } },
            mataPelajaran: { select: { nama: true } },
          },
        },
      },
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.guru.findMany({
      select: { id: true, user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Absensi Guru"
        description="Catat ketidakhadiran guru dan tugaskan guru pengganti"
      />
      <TeacherAbsenceManager
        records={records.map((record) => ({
          id: record.id,
          guru: record.guru.user.name,
          tanggal: record.tanggal.toISOString().slice(0, 10),
          status: record.status,
          kelas: record.jadwal.kelas.nama,
          mapel: record.jadwal.mataPelajaran.nama,
          jam: `${record.jadwal.jamMulai}–${record.jadwal.jamSelesai}`,
          substitute: record.substituteGuru?.user.name ?? null,
        }))}
        guruOptions={guruList.map((g) => ({ id: g.id, nama: g.user.name }))}
      />
    </div>
  );
}
