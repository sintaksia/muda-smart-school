import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import type { Registration } from "@/src/features/registration/services";
import { DetailItem } from "./DetailItem";

export function SekolahAsalTab({
  registration,
}: {
  registration: Registration;
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
              value={registration.previousSchoolName}
            />
            <DetailItem
              label="NPSN"
              value={registration.previousSchoolNpsn || "-"}
            />
            <DetailItem
              label="Alamat Sekolah"
              value={registration.previousSchoolAddress}
            />
            <DetailItem
              label="Tahun Lulus"
              value={registration.graduationYear.toString()}
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
            <DetailItem
              label="Alamat Jalan"
              value={registration.streetAddress}
            />
            <DetailItem
              label="RT/RW"
              value={`${registration.rt}/${registration.rw}`}
            />
            <DetailItem label="Kelurahan/Desa" value={registration.village} />
            <DetailItem label="Kecamatan" value={registration.district} />
            <DetailItem label="Kota/Kabupaten" value={registration.city} />
            <DetailItem label="Provinsi" value={registration.province} />
            <DetailItem
              label="Kode Pos"
              value={registration.postalCode || "-"}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
