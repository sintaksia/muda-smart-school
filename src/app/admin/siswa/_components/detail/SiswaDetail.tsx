"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import type { getSiswaDetail } from "@/src/features/master/services/siswa";
import { ProfilTab } from "./ProfilTab";
import { AbsensiSummaryTab } from "./AbsensiSummaryTab";
import { CreditHistoryTab } from "./CreditHistoryTab";
import { IzinHistoryTab } from "./IzinHistoryTab";

export type SiswaDetailData = NonNullable<
  Awaited<ReturnType<typeof getSiswaDetail>>
>;

interface SiswaDetailProps {
  detail: SiswaDetailData;
}

export function SiswaDetail({ detail }: SiswaDetailProps) {
  return (
    <Tabs defaultValue="profil" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profil">Profil</TabsTrigger>
        <TabsTrigger value="absensi">Absensi</TabsTrigger>
        <TabsTrigger value="kredit">Skor Kredit</TabsTrigger>
        <TabsTrigger value="izin">Riwayat Izin</TabsTrigger>
      </TabsList>

      <TabsContent value="profil">
        <ProfilTab detail={detail} />
      </TabsContent>

      <TabsContent value="absensi">
        <AbsensiSummaryTab absensiSummary={detail.absensiSummary} />
      </TabsContent>

      <TabsContent value="kredit">
        <CreditHistoryTab
          creditEntries={detail.creditEntries}
          creditTotal={detail.creditTotal}
        />
      </TabsContent>

      <TabsContent value="izin">
        <IzinHistoryTab izinHistory={detail.izinHistory} />
      </TabsContent>
    </Tabs>
  );
}
