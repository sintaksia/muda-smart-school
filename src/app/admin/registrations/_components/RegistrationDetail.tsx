"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import type { Pendaftaran } from "@/src/features/registration/services";

interface RegistrationDetailProps {
  registration: Pendaftaran;
}

export function RegistrationDetail({ registration }: RegistrationDetailProps) {
  // Format tanggal
  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID");
  };

  // Format tahun
  const formatYear = (year: number | null) => {
    return year ? year.toString() : "-";
  };

  return (
    <Tabs defaultValue="data-diri" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="data-diri">Data Diri</TabsTrigger>
        <TabsTrigger value="data-ortu">Data Orang Tua</TabsTrigger>
        <TabsTrigger value="sekolah-asal">Sekolah Asal</TabsTrigger>
        <TabsTrigger value="dokumen">Dokumen & Status</TabsTrigger>
      </TabsList>

      {/* Tab 1: Data Diri */}
      <TabsContent value="data-diri">
        <Card>
          <CardHeader>
            <CardTitle>Data Pribadi Calon Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem
                label="Nama Lengkap"
                value={registration.namaLengkap}
              />
              <DetailItem
                label="Jenis Kelamin"
                value={
                  registration.jenisKelamin === "LAKI_LAKI"
                    ? "Laki-laki"
                    : "Perempuan"
                }
              />
              <DetailItem
                label="Program Keahlian"
                value={registration.programKeahlian}
              />
              <DetailItem label="NISN" value={registration.nisn} />
              <DetailItem label="NIK" value={registration.nik} />
              <DetailItem label="No. KK" value={registration.nomorKk} />
              <DetailItem
                label="Tempat Lahir"
                value={registration.tempatLahir}
              />
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
      </TabsContent>

      {/* Tab 2: Data Orang Tua */}
      <TabsContent value="data-ortu">
        <div className="space-y-4">
          {/* Data Ayah */}
          <Card>
            <CardHeader>
              <CardTitle>Data Ayah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem label="Nama Ayah" value={registration.namaAyah} />
                <DetailItem
                  label="Tahun Lahir"
                  value={formatYear(registration.tahunLahirAyah)}
                />
                <DetailItem
                  label="Pendidikan"
                  value={registration.pendidikanAyah}
                />
                <DetailItem
                  label="Pekerjaan"
                  value={registration.pekerjaanAyah || "-"}
                />
                <DetailItem
                  label="No. Telepon"
                  value={registration.noTelpAyah || "-"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Ibu */}
          <Card>
            <CardHeader>
              <CardTitle>Data Ibu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem label="Nama Ibu" value={registration.namaIbu} />
                <DetailItem
                  label="Tahun Lahir"
                  value={formatYear(registration.tahunLahirIbu)}
                />
                <DetailItem
                  label="Pendidikan"
                  value={registration.pendidikanIbu}
                />
                <DetailItem
                  label="Pekerjaan"
                  value={registration.pekerjaanIbu || "-"}
                />
                <DetailItem
                  label="No. Telepon"
                  value={registration.noTelpIbu || "-"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Wali (jika ada) */}
          {registration.namaWali && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Data Wali{" "}
                  {registration.hubunganWali &&
                    `(${registration.hubunganWali})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailItem label="Nama Wali" value={registration.namaWali} />
                  <DetailItem
                    label="Tahun Lahir"
                    value={formatYear(registration.tahunLahirWali)}
                  />
                  <DetailItem
                    label="Pendidikan"
                    value={registration.pendidikanWali || "-"}
                  />
                  <DetailItem
                    label="Pekerjaan"
                    value={registration.pekerjaanWali || "-"}
                  />
                  <DetailItem
                    label="No. Telepon"
                    value={registration.noTelpWali || "-"}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      {/* Tab 3: Sekolah Asal */}
      <TabsContent value="sekolah-asal">
        <Card>
          <CardHeader>
            <CardTitle>Sekolah Asal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem
                label="Nama Sekolah"
                value={registration.namaAsalSekolah}
              />
              <DetailItem
                label="NPSN"
                value={registration.npsnAsalSekolah || "-"}
              />
              <DetailItem
                label="Alamat Sekolah"
                value={registration.alamatAsalSekolah}
              />
              <DetailItem
                label="Tahun Lulus"
                value={registration.tahunLulus.toString()}
              />
            </div>
          </CardContent>
        </Card>

        {/* Alamat Rumah */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Alamat Tempat Tinggal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem
                label="Alamat Jalan"
                value={registration.alamatJalan}
              />
              <DetailItem
                label="RT/RW"
                value={`${registration.rt}/${registration.rw}`}
              />
              <DetailItem
                label="Kelurahan/Desa"
                value={registration.kelurahanDesa}
              />
              <DetailItem label="Kecamatan" value={registration.kecamatan} />
              <DetailItem
                label="Kota/Kabupaten"
                value={registration.kotaKabupaten}
              />
              <DetailItem label="Provinsi" value={registration.provinsi} />
              <DetailItem
                label="Kode Pos"
                value={registration.kodePos || "-"}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab 4: Dokumen & Status */}
      <TabsContent value="dokumen">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pendaftaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem
                label="No. Pendaftaran"
                value={registration.nomorPendaftaran || "-"}
              />
              <DetailItem
                label="Tanggal Pendaftaran"
                value={formatDate(registration.tanggalPendaftaran)}
              />
              <DetailItem label="Status" value={registration.status} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// Helper component
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base">{value}</p>
    </div>
  );
}
