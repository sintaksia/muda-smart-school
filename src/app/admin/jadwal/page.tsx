import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../_components/PageHeader";
import { JadwalManager } from "./_components/JadwalManager";

export const dynamic = "force-dynamic";

export default async function JadwalPage() {
  const [jadwal, kelasList, mapelList, guruList] = await Promise.all([
    prisma.jadwal.findMany({
      where: { isActive: true },
      include: {
        kelas: { select: { id: true, nama: true } },
        mataPelajaran: { select: { id: true, nama: true } },
        guru: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
    }),
    prisma.kelas.findMany({
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    }),
    prisma.mataPelajaran.findMany({
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    }),
    prisma.guru.findMany({
      select: { id: true, user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Pelajaran"
        description="Kelola jadwal guru × mapel × kelas dengan validasi bentrok otomatis"
      />
      <JadwalManager
        jadwal={jadwal.map((j) => ({
          id: j.id,
          hari: j.hari,
          jamMulai: j.jamMulai,
          jamSelesai: j.jamSelesai,
          kelas: j.kelas.nama,
          mataPelajaran: j.mataPelajaran.nama,
          guru: j.guru.user.name,
        }))}
        kelasOptions={kelasList}
        mapelOptions={mapelList}
        guruOptions={guruList.map((g) => ({ id: g.id, nama: g.user.name }))}
      />
    </div>
  );
}
