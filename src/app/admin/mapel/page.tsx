import { PageHeader } from "../_components/PageHeader";
import { getMapelList } from "@/src/features/master/services/mapel";
import { MapelManager } from "./_components/MapelManager";

export const dynamic = "force-dynamic";

export default async function MapelPage() {
  const mapelList = await getMapelList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mata Pelajaran"
        description="Kelola daftar mata pelajaran"
      />
      <MapelManager
        mapelList={mapelList.map((mapel) => ({
          id: mapel.id,
          nama: mapel.nama,
          kode: mapel.kode,
          specialization: mapel.specialization,
          tingkat: mapel.tingkat,
          jumlahGuru: mapel._count.guru,
          jumlahJadwal: mapel._count.jadwal,
        }))}
      />
    </div>
  );
}
