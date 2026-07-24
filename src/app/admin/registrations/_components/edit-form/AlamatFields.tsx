"use client";

import { MapPin } from "lucide-react";
import {
  FormSection,
  TextFormField,
  type RegistrasiControl,
} from "./FormFields";

export function AlamatFields({ control }: { control: RegistrasiControl }) {
  return (
    <FormSection title="Alamat" icon={<MapPin className="size-5" />}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextFormField
          control={control}
          name="streetAddress"
          label="Alamat Jalan"
          className="md:col-span-2"
        />
        <div className="grid grid-cols-2 gap-4">
          <TextFormField control={control} name="rt" label="RT" />
          <TextFormField control={control} name="rw" label="RW" />
        </div>
        <TextFormField
          control={control}
          name="village"
          label="Kelurahan/Desa"
        />
        <TextFormField control={control} name="district" label="Kecamatan" />
        <TextFormField control={control} name="city" label="Kota/Kabupaten" />
        <TextFormField control={control} name="province" label="Provinsi" />
        <TextFormField control={control} name="postalCode" label="Kode Pos" />
      </div>
    </FormSection>
  );
}
