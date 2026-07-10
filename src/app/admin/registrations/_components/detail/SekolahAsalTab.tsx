import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import type { Pendaftaran } from "@/src/features/registration/services";
import { DetailItem } from "./DetailItem";

export function SekolahAsalTab({
  registration,
}: {
  registration: Pendaftaran;
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sekolah Asal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <DetailItem
              label="Nama Sekolah"
              value={registration.namaAsalSekolah}
            />
            <DetailItem
              label="NPSN"
              value={registration.npsnAsalSekolah || "-"}
            />
            <DetailItem
              label="Alamat Sekolah"
              value={registration.alamatAsalSekolah}
            />
            <DetailItem
              label="Tahun Lulus"
              value={registration.tahunLulus.toString()}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Alamat Tempat Tinggal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <DetailItem label="Alamat Jalan" value={registration.alamatJalan} />
            <DetailItem
              label="RT/RW"
              value={`${registration.rt}/${registration.rw}`}
            />
            <DetailItem
              label="Kelurahan/Desa"
              value={registration.kelurahanDesa}
            />
            <DetailItem label="Kecamatan" value={registration.kecamatan} />
            <DetailItem
              label="Kota/Kabupaten"
              value={registration.kotaKabupaten}
            />
            <DetailItem label="Provinsi" value={registration.provinsi} />
            <DetailItem label="Kode Pos" value={registration.kodePos || "-"} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
