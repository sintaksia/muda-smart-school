"use client";

import { User } from "lucide-react";
import {
  jenisKelaminOptions,
  programKeahlianOptions,
} from "@/src/features/registration/services/registration.schema";
import {
  FormSection,
  TextFormField,
  SelectFormField,
  type RegistrasiControl,
} from "./FormFields";

export function IdentitasDiriFields({
  control,
}: {
  control: RegistrasiControl;
}) {
  return (
    <FormSection title="Identitas Diri" icon={<User className="size-5" />}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextFormField
          control={control}
          name="namaLengkap"
          label="Nama Lengkap"
          className="md:col-span-2"
        />
        <SelectFormField
          control={control}
          name="jenisKelamin"
          label="Jenis Kelamin"
          placeholder="Pilih jenis kelamin"
          options={jenisKelaminOptions}
        />
        <SelectFormField
          control={control}
          name="programKeahlian"
          label="Program Keahlian"
          placeholder="Pilih program keahlian"
          options={programKeahlianOptions}
        />
        <TextFormField control={control} name="nisn" label="NISN" />
        <TextFormField control={control} name="nik" label="NIK" />
        <TextFormField control={control} name="nomorKk" label="Nomor KK" />
        <TextFormField
          control={control}
          name="tempatLahir"
          label="Tempat Lahir"
        />
        <TextFormField
          control={control}
          name="tanggalLahir"
          label="Tanggal Lahir"
          type="date"
        />
        <TextFormField
          control={control}
          name="noHpMurid"
          label="Nomor HP (WhatsApp) Calon Murid"
        />
        <TextFormField
          control={control}
          name="emailMurid"
          label="Email Calon Murid"
          type="email"
        />
      </div>
    </FormSection>
  );
}
