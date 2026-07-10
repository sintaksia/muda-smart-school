import type { Pendidikan } from "@prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { PENDIDIKAN_LABELS } from "@/src/lib/constants";
import type { Pendaftaran } from "@/src/features/registration/services";
import { DetailItem, formatYear } from "./DetailItem";

interface OrangTuaCardProps {
  title: string;
  namaLabel: string;
  nama: string;
  tahunLahir: number | null;
  pendidikan: Pendidikan | null;
  pekerjaan: string | null;
  noTelp: string | null;
}

function OrangTuaCard({
  title,
  namaLabel,
  nama,
  tahunLahir,
  pendidikan,
  pekerjaan,
  noTelp,
}: OrangTuaCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailItem label={namaLabel} value={nama} />
          <DetailItem label="Tahun Lahir" value={formatYear(tahunLahir)} />
          <DetailItem
            label="Pendidikan"
            value={
              pendidikan ? (PENDIDIKAN_LABELS[pendidikan] ?? pendidikan) : "-"
            }
          />
          <DetailItem label="Pekerjaan" value={pekerjaan || "-"} />
          <DetailItem label="No. Telepon" value={noTelp || "-"} />
        </div>
      </CardContent>
    </Card>
  );
}

export function DataOrtuTab({ registration }: { registration: Pendaftaran }) {
  return (
    <div className="space-y-4">
      <OrangTuaCard
        title="Data Ayah"
        namaLabel="Nama Ayah"
        nama={registration.namaAyah}
        tahunLahir={registration.tahunLahirAyah}
        pendidikan={registration.pendidikanAyah}
        pekerjaan={registration.pekerjaanAyah}
        noTelp={registration.noTelpAyah}
      />
      <OrangTuaCard
        title="Data Ibu"
        namaLabel="Nama Ibu"
        nama={registration.namaIbu}
        tahunLahir={registration.tahunLahirIbu}
        pendidikan={registration.pendidikanIbu}
        pekerjaan={registration.pekerjaanIbu}
        noTelp={registration.noTelpIbu}
      />
      {registration.namaWali && (
        <OrangTuaCard
          title={
            registration.hubunganWali
              ? `Data Wali (${registration.hubunganWali})`
              : "Data Wali"
          }
          namaLabel="Nama Wali"
          nama={registration.namaWali}
          tahunLahir={registration.tahunLahirWali}
          pendidikan={registration.pendidikanWali}
          pekerjaan={registration.pekerjaanWali}
          noTelp={registration.noTelpWali}
        />
      )}
    </div>
  );
}
