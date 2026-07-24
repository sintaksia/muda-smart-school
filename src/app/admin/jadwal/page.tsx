import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../_components/PageHeader";
import { JadwalManager } from "./_components/JadwalManager";

export const dynamic = "force-dynamic";

export default async function JadwalPage() {
  const [jadwal, kelasList, mapelList, guruList] = await Promise.all([
    prisma.schedule.findMany({
      where: { isActive: true },
      include: {
        kelas: { select: { id: true, name: true } },
        mataPelajaran: { select: { id: true, name: true } },
        guru: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.schoolClass.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.teacher.findMany({
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
          dayOfWeek: j.dayOfWeek,
          startTime: j.startTime,
          endTime: j.endTime,
          classId: j.kelas.id,
          kelas: j.kelas.name,
          teacherId: j.guru.id,
          guru: j.guru.user.name,
          mataPelajaran: j.mataPelajaran.name,
        }))}
        kelasOptions={kelasList.map((k) => ({ id: k.id, nama: k.name }))}
        mapelOptions={mapelList.map((m) => ({ id: m.id, nama: m.name }))}
        guruOptions={guruList.map((g) => ({ id: g.id, nama: g.user.name }))}
      />
    </div>
  );
}
