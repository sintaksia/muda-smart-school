import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { ProgramTable } from "./_components/ProgramTable";
import { getPrograms } from "@/src/features/cms/services/programs";

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Program Keahlian"
        description="Kelola program keahlian/jurusan yang tersedia"
        action={
          <CreateButton
            href="/admin/cms/programs/create"
            label="Tambah Program"
          />
        }
      />
      <ProgramTable data={programs} />
    </div>
  );
}
