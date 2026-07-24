import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { GENDER_LABELS, SPECIALIZATION_LABELS } from "@/src/lib/constants";
import type { Registration } from "@/src/features/registration/services";
import { DetailItem, formatDate } from "./DetailItem";

export function DataDiriTab({ registration }: { registration: Registration }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Pribadi Calon Siswa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailItem label="Nama Lengkap" value={registration.fullName} />
          <DetailItem
            label="Jenis Kelamin"
            value={GENDER_LABELS[registration.gender] ?? registration.gender}
          />
          <DetailItem
            label="Program Keahlian"
            value={
              SPECIALIZATION_LABELS[registration.specialization] ??
              registration.specialization
            }
          />
          <DetailItem label="NISN" value={registration.nisn} />
          <DetailItem label="NIK" value={registration.nik} />
          <DetailItem label="No. KK" value={registration.familyCardNumber} />
          <DetailItem label="Tempat Lahir" value={registration.birthPlace} />
          <DetailItem
            label="Tanggal Lahir"
            value={formatDate(registration.birthDate)}
          />
          <DetailItem
            label="No. HP Siswa"
            value={registration.studentPhone || "-"}
          />
          <DetailItem
            label="Email Siswa"
            value={registration.studentEmail || "-"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
