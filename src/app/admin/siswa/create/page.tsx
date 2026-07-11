import { PageHeader } from "../../_components/PageHeader";
import { FormCard } from "../../_components/FormCard";
import { getKelasList } from "@/src/features/master/services/kelas";
import { SiswaCreateForm } from "../_components/SiswaCreateForm";

export const dynamic = "force-dynamic";

export default async function CreateSiswaPage() {
  const kelasList = await getKelasList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Siswa"
        description="Buat akun siswa secara manual, misalnya untuk siswa pindahan yang tidak melalui PPDB"
      />
      <FormCard
        title="Data Siswa"
        description="Akun login dibuat dengan email dan password di bawah"
      >
        <SiswaCreateForm
          kelasOptions={kelasList.map((kelas) => ({
            id: kelas.id,
            nama: kelas.nama,
            tingkat: kelas.tingkat,
            tahunAjaran: kelas.tahunAjaran,
          }))}
        />
      </FormCard>
    </div>
  );
}
