import type { Education } from "@prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { EDUCATION_LABELS } from "@/src/lib/constants";
import type { Registration } from "@/src/features/registration/services";
import { DetailItem, formatYear } from "./DetailItem";

interface OrangTuaCardProps {
  title: string;
  namaLabel: string;
  nama: string;
  tahunLahir: number | null;
  pendidikan: Education | null;
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
              pendidikan ? (EDUCATION_LABELS[pendidikan] ?? pendidikan) : "-"
            }
          />
          <DetailItem label="Pekerjaan" value={pekerjaan || "-"} />
          <DetailItem label="No. Telepon" value={noTelp || "-"} />
        </div>
      </CardContent>
    </Card>
  );
}

export function DataOrtuTab({ registration }: { registration: Registration }) {
  return (
    <div className="space-y-4">
      <OrangTuaCard
        title="Data Ayah"
        namaLabel="Nama Ayah"
        nama={registration.fatherName}
        tahunLahir={registration.fatherBirthYear}
        pendidikan={registration.fatherEducation}
        pekerjaan={registration.fatherOccupation}
        noTelp={registration.fatherPhone}
      />
      <OrangTuaCard
        title="Data Ibu"
        namaLabel="Nama Ibu"
        nama={registration.motherName}
        tahunLahir={registration.motherBirthYear}
        pendidikan={registration.motherEducation}
        pekerjaan={registration.motherOccupation}
        noTelp={registration.motherPhone}
      />
      {registration.guardianName && (
        <OrangTuaCard
          title={
            registration.guardianRelationship
              ? `Data Wali (${registration.guardianRelationship})`
              : "Data Wali"
          }
          namaLabel="Nama Wali"
          nama={registration.guardianName}
          tahunLahir={registration.guardianBirthYear}
          pendidikan={registration.guardianEducation}
          pekerjaan={registration.guardianOccupation}
          noTelp={registration.guardianPhone}
        />
      )}
    </div>
  );
}
