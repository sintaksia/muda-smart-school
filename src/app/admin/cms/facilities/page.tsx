import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { FacilityTable } from "./_components/FacilityTable";
import { getFacilities } from "@/src/features/cms/services/facilities";

export default async function FacilitiesPage() {
  const facilities = await getFacilities();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fasilitas"
        description="Kelola fasilitas sekolah"
        action={
          <CreateButton
            href="/admin/cms/facilities/create"
            label="Tambah Fasilitas"
          />
        }
      />
      <FacilityTable data={facilities} />
    </div>
  );
}
