"use client";

import { Users } from "lucide-react";
import { educationOptions } from "@/src/features/registration/services/registration.schema";
import {
  FormSection,
  TextFormField,
  SelectFormField,
  type RegistrasiControl,
  type RegistrasiFieldName,
} from "./FormFields";

interface OrangTuaFieldNames {
  nama: RegistrasiFieldName;
  tahunLahir: RegistrasiFieldName;
  pendidikan: RegistrasiFieldName;
  pekerjaan: RegistrasiFieldName;
  noTelp: RegistrasiFieldName;
}

interface OrangTuaFieldsProps {
  control: RegistrasiControl;
  title: string;
  subjek: string; // "Ayah" | "Ibu" | "Wali" — dipakai di label field
  names: OrangTuaFieldNames;
  pendidikanPlaceholder?: string;
  children?: React.ReactNode;
}

export function OrangTuaFields({
  control,
  title,
  subjek,
  names,
  pendidikanPlaceholder = "Pilih pendidikan",
  children,
}: OrangTuaFieldsProps) {
  return (
    <FormSection title={title} icon={<Users className="size-5" />}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextFormField
          control={control}
          name={names.nama}
          label={`Nama ${subjek}`}
          className="md:col-span-2"
        />
        <TextFormField
          control={control}
          name={names.tahunLahir}
          label={`Tahun Lahir ${subjek}`}
        />
        <SelectFormField
          control={control}
          name={names.pendidikan}
          label={subjek === "Wali" ? "Pendidikan Wali" : "Pendidikan Terakhir"}
          placeholder={pendidikanPlaceholder}
          options={educationOptions}
        />
        <TextFormField
          control={control}
          name={names.pekerjaan}
          label={`Pekerjaan ${subjek}`}
        />
        <TextFormField
          control={control}
          name={names.noTelp}
          label={`Nomor Telepon ${subjek}`}
        />
        {children}
      </div>
    </FormSection>
  );
}
