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
  genderOptions,
  specializationOptions,
  educationOptions,
  requiredFields,
} from "../../../features/registration/services/registration.schema";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { DateField } from "@/src/components/common/DateField";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";

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

export default function RegistrasiForm() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingData, setPendingData] = useState<RegistrasiFormData | null>(
    null,
  );

  const form = useForm<RegistrasiFormData>({
    resolver: zodResolver(registrasiSchema),
    mode: "onChange",
    defaultValues: {
      // Identitas Diri
      fullName: "",
      gender: undefined,
      specialization: undefined,
      nisn: "",
      nik: "",
      familyCardNumber: "",
      birthPlace: "",
      birthDate: "",
      studentPhone: "",
      studentEmail: "",
      fatherPhone: "",
      motherPhone: "",

      // Alamat
      streetAddress: "",
      rt: "",
      rw: "",
      village: "",
      district: "",
      city: "",
      province: "",
      postalCode: "",

      // Data Ayah
      fatherName: "",
      fatherBirthYear: "",
      fatherEducation: undefined,
      fatherOccupation: "",

      // Data Ibu
      motherName: "",
      motherBirthYear: "",
      motherEducation: undefined,
      motherOccupation: "",

      // Data Wali (Opsional)
      guardianName: "",
      guardianBirthYear: "",
      guardianEducation: undefined,
      guardianOccupation: "",
      guardianPhone: "",
      guardianRelationship: "",

      // Asal Sekolah
      previousSchoolName: "",
      previousSchoolNpsn: "",
      previousSchoolAddress: "",
      graduationYear: "",
    },
  });

  function onSubmit(data: RegistrasiFormData) {
    setPendingData(data);
    setIsDialogOpen(true);
  }

  async function handleConfirmSubmit() {
    if (!pendingData) return;

    setIsSubmitting(true);
    setIsDialogOpen(false);

    try {
      const response = await fetch("/api/registrasi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pendingData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(
          result.error || result.message || "Terjadi kesalahan saat mendaftar",
        );
        return;
      }

      toast.success("Pendaftaran berhasil! Terima kasih telah mendaftar.");
      router.push("/");
    } catch {
      toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
      setPendingData(null);
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
              name="fullName"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <FieldLabel name="fullName">Nama Lengkap</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama lengkap sesuai akta lahir"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="gender">Jenis Kelamin</FieldLabel>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {genderOptions.map((option) => (
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
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="specialization">
                      Program Keahlian
                    </FieldLabel>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih program keahlian" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specializationOptions.map((option) => (
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
                    <Input placeholder="10 digit NISN" {...field} />
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
                    <Input placeholder="16 digit NIK" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="familyCardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="familyCardNumber">Nomor KK</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="16 digit Nomor Kartu Keluarga"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthPlace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="birthPlace">Tempat Lahir</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Kota tempat lahir" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="birthDate">Tanggal Lahir</FieldLabel>
                  </FormLabel>
                  <DateField
                    ariaLabel="Tanggal Lahir"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    birthDate
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="studentPhone">
                      Nomor HP (WhatsApp) Calon Murid
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="081234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Calon Murid</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contoh@email.com (opsional)"
                      {...field}
                    />
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
              name="streetAddress"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <FieldLabel name="streetAddress">Alamat Jalan</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jl. Nama Jalan No. X, Gang/Perumahan"
                      {...field}
                    />
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
                      <Input placeholder="001" {...field} />
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
                      <Input placeholder="002" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="village">Kelurahan/Desa</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nama kelurahan/desa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="district">Kecamatan</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nama district" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="city">Kota/Kabupaten</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nama kota/kabupaten" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="province">Provinsi</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nama province" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Pos</FormLabel>
                  <FormControl>
                    <Input placeholder="12345 (opsional)" {...field} />
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
              name="fatherName"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <FieldLabel name="fatherName">Nama Ayah</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap ayah" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fatherBirthYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="fatherBirthYear">
                      Tahun Lahir Ayah
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="1975" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fatherEducation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="fatherEducation">
                      Pendidikan Terakhir
                    </FieldLabel>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pendidikan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {educationOptions.map((option) => (
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
              name="fatherOccupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="fatherOccupation">
                      Pekerjaan Ayah
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Pekerjaan ayah" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fatherPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon Ayah</FormLabel>
                  <FormControl>
                    <Input placeholder="081234567890 (opsional)" {...field} />
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
              name="motherName"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <FieldLabel name="motherName">Nama Ibu</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap ibu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motherBirthYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="motherBirthYear">
                      Tahun Lahir Ibu
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="1978" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motherEducation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="motherEducation">
                      Pendidikan Terakhir
                    </FieldLabel>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pendidikan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {educationOptions.map((option) => (
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
              name="motherOccupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="motherOccupation">
                      Pekerjaan Ibu
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Pekerjaan ibu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motherPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon Ibu</FormLabel>
                  <FormControl>
                    <Input placeholder="081234567890 (opsional)" {...field} />
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
              name="guardianName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Wali</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama wali (jika diperlukan)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guardianBirthYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun Lahir Wali</FormLabel>
                  <FormControl>
                    <Input placeholder="1970 (opsional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guardianEducation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pendidikan Wali</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pendidikan (opsional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {educationOptions.map((option) => (
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
              name="guardianOccupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pekerjaan Wali</FormLabel>
                  <FormControl>
                    <Input placeholder="Pekerjaan wali (opsional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guardianPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon Wali</FormLabel>
                  <FormControl>
                    <Input placeholder="081234567890 (opsional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guardianRelationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hubungan dengan Siswa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Paman, Bibi, Kakek"
                      {...field}
                    />
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
              name="previousSchoolName"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <FieldLabel name="previousSchoolName">
                      Nama SMP/MTs/Sederajat
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap sekolah asal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previousSchoolNpsn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="previousSchoolNpsn">
                      NPSN Sekolah Asal
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="8 digit NPSN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="graduationYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FieldLabel name="graduationYear">Tahun Lulus</FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={`2022`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previousSchoolAddress"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <FieldLabel name="previousSchoolAddress">
                      Alamat Sekolah Asal
                    </FieldLabel>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Alamat lengkap sekolah asal"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="bg-primary-900 hover:bg-primary-800 text-white px-12"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Daftar Sekarang"
            )}
          </Button>
        </div>
      </form>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pendaftaran</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin data yang diisi sudah benar? Data yang sudah
              dikirim tidak dapat diubah. Pastikan semua data sudah sesuai
              dengan dokumen asli.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              className="bg-primary-900 hover:bg-primary-800"
            >
              Ya, Kirim Pendaftaran
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
