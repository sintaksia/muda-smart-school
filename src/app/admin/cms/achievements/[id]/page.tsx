import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { AchievementForm } from "../_components/AchievementForm";
import { getAchievementById } from "@/src/features/cms/services/achievements";

interface EditAchievementPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAchievementPage({
  params,
}: EditAchievementPageProps) {
  const { id } = await params;
  const achievement = await getAchievementById(id);

  if (!achievement) {
    notFound();
  }

  const defaultValues = {
    title: achievement.title,
    event: achievement.event,
    level: achievement.level,
    medalType: achievement.medalType,
    year: achievement.year,
    image: achievement.image || "",
    order: achievement.order,
    isActive: achievement.isActive,
    isHighlight: achievement.isHighlight,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Prestasi"
        description={`Ubah data prestasi ${achievement.title}`}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/cms/achievements">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
        }
      />
      <AchievementForm defaultValues={defaultValues} achievementId={id} />
    </div>
  );
}
