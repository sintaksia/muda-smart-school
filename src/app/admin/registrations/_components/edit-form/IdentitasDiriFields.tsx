"use client";

import { User } from "lucide-react";
import {
  genderOptions,
  specializationOptions,
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
          name="fullName"
          label="Nama Lengkap"
          className="md:col-span-2"
        />
        <SelectFormField
          control={control}
          name="gender"
          label="Jenis Kelamin"
          placeholder="Pilih jenis kelamin"
          options={genderOptions}
        />
        <SelectFormField
          control={control}
          name="specialization"
          label="Program Keahlian"
          placeholder="Pilih program keahlian"
          options={specializationOptions}
        />
        <TextFormField control={control} name="nisn" label="NISN" />
        <TextFormField control={control} name="nik" label="NIK" />
        <TextFormField
          control={control}
          name="familyCardNumber"
          label="Nomor KK"
        />
        <TextFormField
          control={control}
          name="birthPlace"
          label="Tempat Lahir"
        />
        <TextFormField
          control={control}
          name="birthDate"
          label="Tanggal Lahir"
          type="date"
        />
        <TextFormField
          control={control}
          name="studentPhone"
          label="Nomor HP (WhatsApp) Calon Murid"
        />
        <TextFormField
          control={control}
          name="studentEmail"
          label="Email Calon Murid"
          type="email"
        />
      </div>
    </FormSection>
  );
}
