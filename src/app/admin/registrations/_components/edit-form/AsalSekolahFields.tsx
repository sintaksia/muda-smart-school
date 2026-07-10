"use client";

import { School } from "lucide-react";
import {
  FormSection,
  TextFormField,
  type RegistrasiControl,
} from "./FormFields";

export function AsalSekolahFields({ control }: { control: RegistrasiControl }) {
  return (
    <FormSection title="Asal Sekolah" icon={<School className="size-5" />}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextFormField
          control={control}
          name="namaAsalSekolah"
          label="Nama SMP/MTs/Sederajat"
          className="md:col-span-2"
        />
        <TextFormField
          control={control}
          name="npsnAsalSekolah"
          label="NPSN Sekolah Asal"
        />
        <TextFormField
          control={control}
          name="tahunLulus"
          label="Tahun Lulus"
        />
        <TextFormField
          control={control}
          name="alamatAsalSekolah"
          label="Alamat Sekolah Asal"
          className="md:col-span-2"
        />
      </div>
    </FormSection>
  );
}
