import { PageHeader } from "../_components/PageHeader";
import { getGuruList } from "@/src/features/master/services/guru";
import { getMapelList } from "@/src/features/master/services/mapel";
import { GuruManager } from "./_components/GuruManager";

export const dynamic = "force-dynamic";

export default async function GuruPage() {
  const [guruList, mapelList] = await Promise.all([
    getGuruList(),
    getMapelList(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guru"
        description="Kelola akun guru dan kualifikasi mata pelajaran"
      />
      <GuruManager
        guruList={guruList.map((guru) => ({
          id: guru.id,
          nama: guru.user.name,
          email: guru.user.email,
          nip: guru.nip,
          statusKepegawaian: guru.statusKepegawaian,
          mapel: guru.mataPelajaran.map((gm) => gm.mataPelajaran.nama),
          waliDari: guru.kelasWali.map((k) => k.nama),
        }))}
        mapelOptions={mapelList.map((m) => ({ id: m.id, nama: m.nama }))}
      />
    </div>
  );
}
