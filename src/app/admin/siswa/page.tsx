import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "../_components/PageHeader";
import { getSiswaList } from "@/src/features/master/services/siswa";
import { getKelasList } from "@/src/features/master/services/kelas";
import { SiswaTable } from "./_components/SiswaTable";

export const dynamic = "force-dynamic";

export default async function SiswaPage() {
  const [siswaList, kelasList] = await Promise.all([
    getSiswaList(),
    getKelasList(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Siswa"
        description="Kelola data siswa, penempatan kelas, kenaikan kelas, dan kelulusan"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/master/siswa/export">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/admin/siswa/create">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Siswa
              </Link>
            </Button>
          </div>
        }
      />
      <SiswaTable
        siswaList={siswaList.map((siswa) => ({
          id: siswa.id,
          nama: siswa.user.name,
          email: siswa.user.email,
          nis: siswa.nis,
          nisn: siswa.nisn,
          programKeahlian: siswa.programKeahlian,
          angkatan: siswa.angkatan,
          kelasId: siswa.kelas?.id ?? null,
          kelasNama: siswa.kelas?.nama ?? null,
          status: siswa.status,
        }))}
        kelasOptions={kelasList.map((kelas) => ({
          id: kelas.id,
          nama: kelas.nama,
          tingkat: kelas.tingkat,
          tahunAjaran: kelas.tahunAjaran,
        }))}
      />
    </div>
  );
}
