import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { AchievementTable } from "./_components/AchievementTable";
import { getAchievements } from "@/src/features/cms/services/achievements";

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prestasi"
        description="Kelola prestasi dan penghargaan sekolah"
        action={
          <CreateButton
            href="/admin/cms/achievements/create"
            label="Tambah Prestasi"
          />
        }
      />
      <AchievementTable data={achievements} />
    </div>
  );
}
