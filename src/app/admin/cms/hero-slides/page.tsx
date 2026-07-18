import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { HeroSlideTable } from "./_components/HeroSlideTable";
import { getHeroSlides } from "@/src/features/cms/services/hero-slides";

export default async function HeroSlidesPage() {
  const slides = await getHeroSlides();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero Slider"
        description="Kelola slide hero banner homepage"
        action={
          <CreateButton
            href="/admin/cms/hero-slides/create"
            label="Tambah Slide"
          />
        }
      />
      <HeroSlideTable data={slides} />
    </div>
  );
}
