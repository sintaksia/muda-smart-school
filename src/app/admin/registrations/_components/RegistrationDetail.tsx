"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import type { Pendaftaran } from "@/src/features/registration/services";
import { DataDiriTab } from "./detail/DataDiriTab";
import { DataOrtuTab } from "./detail/DataOrtuTab";
import { SekolahAsalTab } from "./detail/SekolahAsalTab";
import { DokumenTab } from "./detail/DokumenTab";

interface RegistrationDetailProps {
  registration: Pendaftaran;
}

export function RegistrationDetail({ registration }: RegistrationDetailProps) {
  return (
    <Tabs defaultValue="data-diri" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="data-diri">Data Diri</TabsTrigger>
        <TabsTrigger value="data-ortu">Data Orang Tua</TabsTrigger>
        <TabsTrigger value="sekolah-asal">Sekolah Asal</TabsTrigger>
        <TabsTrigger value="dokumen">Dokumen & Status</TabsTrigger>
      </TabsList>

      <TabsContent value="data-diri">
        <DataDiriTab registration={registration} />
      </TabsContent>

      <TabsContent value="data-ortu">
        <DataOrtuTab registration={registration} />
      </TabsContent>

      <TabsContent value="sekolah-asal">
        <SekolahAsalTab registration={registration} />
      </TabsContent>

      <TabsContent value="dokumen">
        <DokumenTab registration={registration} />
      </TabsContent>
    </Tabs>
  );
}
