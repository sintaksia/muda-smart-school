"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  PROGRAM_KEAHLIAN_LABELS,
  STUDENT_STATUS_BADGES,
  STUDENT_STATUS_LABELS,
} from "@/src/lib/constants";
import { DetailItem } from "./DetailItem";
import { BiodataSection } from "./BiodataSection";
import type { SiswaDetailData } from "./SiswaDetail";

interface ProfilTabProps {
  detail: SiswaDetailData;
}

export function ProfilTab({ detail }: ProfilTabProps) {
  const { siswa } = detail;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Akademik</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Nama Lengkap" value={siswa.user.name} />
          <DetailItem label="NIS" value={siswa.nis} />
          <DetailItem label="NISN" value={siswa.nisn} />
          <DetailItem
            label="Program Keahlian"
            value={
              PROGRAM_KEAHLIAN_LABELS[siswa.programKeahlian] ??
              siswa.programKeahlian
            }
          />
          <DetailItem label="Angkatan" value={siswa.angkatan} />
          <DetailItem
            label="Status"
            value={
              <Badge variant={STUDENT_STATUS_BADGES[siswa.status] ?? "warning"}>
                {STUDENT_STATUS_LABELS[siswa.status] ?? siswa.status}
              </Badge>
            }
          />
          <DetailItem
            label="Kelas"
            value={
              siswa.kelas
                ? `${siswa.kelas.nama} — ${siswa.kelas.tahunAjaran}`
                : "Belum ditempatkan"
            }
          />
          <DetailItem
            label="Wali Kelas"
            value={siswa.kelas?.waliKelas?.user.name ?? "-"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Akun</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Email" value={siswa.user.email} />
          <DetailItem label="No. HP" value={siswa.user.phone ?? "-"} />
          <DetailItem label="Status Akun" value={siswa.user.status} />
        </CardContent>
      </Card>

      <BiodataSection pendaftaran={siswa.pendaftaran} />
    </div>
  );
}
