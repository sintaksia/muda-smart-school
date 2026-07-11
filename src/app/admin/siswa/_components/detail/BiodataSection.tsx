"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { JENIS_KELAMIN_LABELS, PENDIDIKAN_LABELS } from "@/src/lib/constants";
import type { Pendaftaran } from "@prisma/client";
import { DetailItem, formatDate } from "./DetailItem";

interface BiodataSectionProps {
  pendaftaran: Pendaftaran | null;
}

export function BiodataSection({ pendaftaran }: BiodataSectionProps) {
  if (!pendaftaran) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Biodata PPDB</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Biodata PPDB tidak tersedia — siswa ini dibuat secara manual (siswa
            transfer) dan tidak melalui pendaftaran.
          </p>
        </CardContent>
      </Card>
    );
  }

  const alamat = `${pendaftaran.alamatJalan}, RT ${pendaftaran.rt}/RW ${pendaftaran.rw}, ${pendaftaran.kelurahanDesa}, ${pendaftaran.kecamatan}, ${pendaftaran.kotaKabupaten}, ${pendaftaran.provinsi}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Biodata PPDB</CardTitle>
        <Link
          href={`/admin/registrations/${pendaftaran.id}`}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Lihat pendaftaran
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem
          label="Jenis Kelamin"
          value={JENIS_KELAMIN_LABELS[pendaftaran.jenisKelamin]}
        />
        <DetailItem
          label="Tempat, Tanggal Lahir"
          value={`${pendaftaran.tempatLahir}, ${formatDate(pendaftaran.tanggalLahir)}`}
        />
        <DetailItem label="NIK" value={pendaftaran.nik} />
        <DetailItem label="No. KK" value={pendaftaran.nomorKk} />
        <DetailItem label="Alamat" value={alamat} />
        <DetailItem
          label="Nama Ayah"
          value={`${pendaftaran.namaAyah} (${PENDIDIKAN_LABELS[pendaftaran.pendidikanAyah] ?? "-"}, ${pendaftaran.pekerjaanAyah})`}
        />
        <DetailItem
          label="Nama Ibu"
          value={`${pendaftaran.namaIbu} (${PENDIDIKAN_LABELS[pendaftaran.pendidikanIbu] ?? "-"}, ${pendaftaran.pekerjaanIbu})`}
        />
        <DetailItem
          label="Sekolah Asal"
          value={`${pendaftaran.namaAsalSekolah} (lulus ${pendaftaran.tahunLulus})`}
        />
        <DetailItem
          label="No. Pendaftaran"
          value={pendaftaran.nomorPendaftaran}
        />
      </CardContent>
    </Card>
  );
}
