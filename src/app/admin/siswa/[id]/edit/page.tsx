import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../../../_components/PageHeader";
import { FormCard } from "../../../_components/FormCard";
import { getKelasList } from "@/src/features/master/services/kelas";
import { SiswaEditForm } from "../../_components/SiswaEditForm";

export const dynamic = "force-dynamic";

interface EditSiswaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSiswaPage({ params }: EditSiswaPageProps) {
  const { id } = await params;
  const [siswa, kelasList] = await Promise.all([
    prisma.student.findUnique({
      where: { id },
      include: { user: { select: { name: true, phone: true } } },
    }),
    getKelasList(),
  ]);

  if (!siswa) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Siswa"
        description={`Perbarui data ${siswa.user.name} — email login dikelola dari menu Kelola User`}
      />
      <FormCard title="Data Siswa">
        <SiswaEditForm
          siswaId={siswa.id}
          defaultValues={{
            name: siswa.user.name,
            phone: siswa.user.phone ?? "",
            nis: siswa.nis,
            nisn: siswa.nisn,
            programKeahlian: siswa.programKeahlian,
            angkatan: siswa.angkatan,
            kelasId: siswa.kelasId,
            status: siswa.status,
          }}
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
