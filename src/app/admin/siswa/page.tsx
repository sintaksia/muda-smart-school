import { PageHeader } from "../_components/PageHeader";
import { getSiswaList } from "@/src/features/master/services/siswa";
import { prisma } from "@/src/lib/prisma";
import { SiswaTable } from "./_components/SiswaTable";

export const dynamic = "force-dynamic";

export default async function SiswaPage() {
  const [siswaList, kelasList] = await Promise.all([
    getSiswaList(),
    prisma.schoolClass.findMany({
      select: { id: true, name: true },
      orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Siswa"
        description="Penempatan kelas dan status siswa — akun dibuat dari menu Pendaftaran"
      />
      <SiswaTable
        siswaList={siswaList.map((siswa) => ({
          id: siswa.id,
          nama: siswa.user.name,
          nis: siswa.nis,
          specialization: siswa.specialization,
          angkatan: siswa.angkatan,
          classId: siswa.schoolClass?.id ?? null,
          status: siswa.status,
        }))}
        kelasOptions={kelasList}
      />
    </div>
  );
}
