import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { ExtracurricularTable } from "./_components/ExtracurricularTable";
import { getExtracurriculars } from "@/src/features/cms/services/extracurriculars";

export default async function ExtracurricularsPage() {
  const extracurriculars = await getExtracurriculars();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ekstrakurikuler"
        description="Kelola kegiatan ekstrakurikuler sekolah"
        action={
          <CreateButton
            href="/admin/cms/extracurriculars/create"
            label="Tambah Ekstrakurikuler"
          />
        }
      />
      <ExtracurricularTable data={extracurriculars} />
    </div>
  );
}
