"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, MapPin, Users, School, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  registrasiSchema,
  type RegistrasiFormData,
  jenisKelaminOptions,
  programKeahlianOptions,
  pendidikanOptions,
  requiredFields,
} from "@/src/features/registration/services/registration.schema";
import type { Pendaftaran } from "@prisma/client";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <Card className="border-primary-100 pt-0 rounded-t-lg">
      <CardHeader className="bg-primary-50 rounded-t-lg pt-2">
        <CardTitle className="flex items-center gap-2 text-primary-900">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}

interface FieldLabelProps {
  name: keyof RegistrasiFormData;
  children: React.ReactNode;
}

function FieldLabel({ name, children }: FieldLabelProps) {
  const isRequired = requiredFields.has(name);
  return (
    <>
      {children}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </>
  );
}

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

function toYearString(year: number | null): string {
  return year ? year.toString() : "";
}

interface RegistrationEditFormProps {
  registration: Pendaftaran;
}

export function RegistrationEditForm({
  registration,
}: RegistrationEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistrasiFormData>({
    resolver: zodResolver(registrasiSchema),
    mode: "onChange",
    defaultValues: {
      namaLengkap: registration.namaLengkap,
      jenisKelamin: registration.jenisKelamin,
      programKeahlian: registration.programKeahlian,
      nisn: registration.nisn,
      nik: registration.nik,
      nomorKk: registration.nomorKk,
      tempatLahir: registration.tempatLahir,
      tanggalLahir: toDateInputValue(registration.tanggalLahir),
      noHpMurid: registration.noHpMurid,
      emailMurid: registration.emailMurid || "",
      noTelpAyah: registration.noTelpAyah || "",
      noTelpIbu: registration.noTelpIbu || "",

      alamatJalan: registration.alamatJalan,
      rt: registration.rt,
      rw: registration.rw,
      kelurahanDesa: registration.kelurahanDesa,
      kecamatan: registration.kecamatan,
      kotaKabupaten: registration.kotaKabupaten,
      provinsi: registration.provinsi,
      kodePos: registration.kodePos || "",

      namaAyah: registration.namaAyah,
      tahunLahirAyah: toYearString(registration.tahunLahirAyah),
      pendidikanAyah: registration.pendidikanAyah,
      pekerjaanAyah: registration.pekerjaanAyah,

      namaIbu: registration.namaIbu,
      tahunLahirIbu: toYearString(registration.tahunLahirIbu),
      pendidikanIbu: registration.pendidikanIbu,
      pekerjaanIbu: registration.pekerjaanIbu,

      namaWali: registration.namaWali || "",
      tahunLahirWali: toYearString(registration.tahunLahirWali),
      pendidikanWali: registration.pendidikanWali || undefined,
      pekerjaanWali: registration.pekerjaanWali || "",
      noTelpWali: registration.noTelpWali || "",
      hubunganWali: registration.hubunganWali || "",

      namaAsalSekolah: registration.namaAsalSekolah,
      npsnAsalSekolah: registration.npsnAsalSekolah || "",
      alamatAsalSekolah: registration.alamatAsalSekolah,
      tahunLulus: registration.tahunLulus.toString(),
    },
  });

  async function onSubmit(data: RegistrasiFormData) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/registrasi/${registration.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Gagal memperbarui data pendaftaran");
        return;
      }

      toast.success("Data pendaftaran berhasil diperbarui");
      router.push(`/admin/registrations/${registration.id}`);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Identitas Diri */}
        <FormSection title="Identitas Diri" icon={<User className="size-5" />}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="namaLengkap"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <FieldLabel name="namaLengkap">Nama Lengkap</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jenisKelamin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="jenisKelamin">Jenis Kelamin</FieldLabel>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jenisKelaminOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="programKeahlian"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="programKeahlian">
                      Program Keahlian
                    </FieldLabel>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih program keahlian" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {programKeahlianOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nisn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="nisn">NISN</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nik"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="nik">NIK</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nomorKk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="nomorKk">Nomor KK</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tempatLahir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="tempatLahir">Tempat Lahir</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tanggalLahir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="tanggalLahir">Tanggal Lahir</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="noHpMurid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="noHpMurid">
                      Nomor HP (WhatsApp) Calon Murid
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailMurid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Calon Murid</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Alamat */}
        <FormSection title="Alamat" icon={<MapPin className="size-5" />}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="alamatJalan"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <FieldLabel name="alamatJalan">Alamat Jalan</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FieldLabel name="rt">RT</FieldLabel>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FieldLabel name="rw">RW</FieldLabel>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="kelurahanDesa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="kelurahanDesa">Kelurahan/Desa</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kecamatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="kecamatan">Kecamatan</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kotaKabupaten"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="kotaKabupaten">Kota/Kabupaten</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provinsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="provinsi">Provinsi</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kodePos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Pos</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Data Ayah */}
        <FormSection title="Data Ayah" icon={<Users className="size-5" />}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="namaAyah"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <FieldLabel name="namaAyah">Nama Ayah</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tahunLahirAyah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="tahunLahirAyah">
                      Tahun Lahir Ayah
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pendidikanAyah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="pendidikanAyah">
                      Pendidikan Terakhir
                    </FieldLabel>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pendidikan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pendidikanOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pekerjaanAyah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="pekerjaanAyah">Pekerjaan Ayah</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="noTelpAyah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon Ayah</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Data Ibu */}
        <FormSection title="Data Ibu" icon={<Users className="size-5" />}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="namaIbu"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <FieldLabel name="namaIbu">Nama Ibu</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tahunLahirIbu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="tahunLahirIbu">
                      Tahun Lahir Ibu
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pendidikanIbu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="pendidikanIbu">
                      Pendidikan Terakhir
                    </FieldLabel>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pendidikan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pendidikanOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pekerjaanIbu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="pekerjaanIbu">Pekerjaan Ibu</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="noTelpIbu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon Ibu</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Data Wali (Opsional) */}
        <FormSection
          title="Data Wali (Opsional)"
          icon={<Users className="size-5" />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="namaWali"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Wali</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tahunLahirWali"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun Lahir Wali</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pendidikanWali"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pendidikan Wali</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pendidikan (opsional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pendidikanOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pekerjaanWali"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pekerjaan Wali</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="noTelpWali"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon Wali</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hubunganWali"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hubungan dengan Siswa</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Asal Sekolah */}
        <FormSection title="Asal Sekolah" icon={<School className="size-5" />}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="namaAsalSekolah"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <FieldLabel name="namaAsalSekolah">
                      Nama SMP/MTs/Sederajat
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="npsnAsalSekolah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="npsnAsalSekolah">
                      NPSN Sekolah Asal
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tahunLulus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="tahunLulus">Tahun Lulus</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alamatAsalSekolah"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <FieldLabel name="alamatAsalSekolah">
                      Alamat Sekolah Asal
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(`/admin/registrations/${registration.id}`)
            }
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-900 hover:bg-primary-800 text-white px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
