import { PageHeader } from "../_components/PageHeader";
import { getKelasList } from "@/src/features/master/services/kelas";
import { prisma } from "@/src/lib/prisma";
import { KelasManager } from "./_components/KelasManager";

export const dynamic = "force-dynamic";

export default async function KelasPage() {
  const [kelasList, guruList] = await Promise.all([
    getKelasList(),
    prisma.guru.findMany({
      select: { id: true, user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelas"
        description="Kelola rombongan belajar dan wali kelas"
      />
      <KelasManager
        kelasList={kelasList.map((kelas) => ({
          id: kelas.id,
          nama: kelas.nama,
          tingkat: kelas.tingkat,
          specialization: kelas.specialization,
          tahunAjaran: kelas.tahunAjaran,
          waliKelasId: kelas.waliKelas?.id ?? null,
          waliKelas: kelas.waliKelas?.user.name ?? null,
          jumlahSiswa: kelas._count.students,
        }))}
        guruOptions={guruList.map((g) => ({ id: g.id, nama: g.user.name }))}
      />
    </div>
  );
}
