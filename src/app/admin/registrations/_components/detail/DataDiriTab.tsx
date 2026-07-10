import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  JENIS_KELAMIN_LABELS,
  PROGRAM_KEAHLIAN_LABELS,
} from "@/src/lib/constants";
import type { Pendaftaran } from "@/src/features/registration/services";
import { DetailItem, formatDate } from "./DetailItem";

export function DataDiriTab({ registration }: { registration: Pendaftaran }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Pribadi Calon Siswa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailItem label="Nama Lengkap" value={registration.namaLengkap} />
          <DetailItem
            label="Jenis Kelamin"
            value={
              JENIS_KELAMIN_LABELS[registration.jenisKelamin] ??
              registration.jenisKelamin
            }
          />
          <DetailItem
            label="Program Keahlian"
            value={
              PROGRAM_KEAHLIAN_LABELS[registration.programKeahlian] ??
              registration.programKeahlian
            }
          />
          <DetailItem label="NISN" value={registration.nisn} />
          <DetailItem label="NIK" value={registration.nik} />
          <DetailItem label="No. KK" value={registration.nomorKk} />
          <DetailItem label="Tempat Lahir" value={registration.tempatLahir} />
          <DetailItem
            label="Tanggal Lahir"
            value={formatDate(registration.tanggalLahir)}
          />
          <DetailItem
            label="No. HP Siswa"
            value={registration.noHpMurid || "-"}
          />
          <DetailItem
            label="Email Siswa"
            value={registration.emailMurid || "-"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
