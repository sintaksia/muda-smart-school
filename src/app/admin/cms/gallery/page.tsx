import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { GalleryTable } from "./_components/GalleryTable";
import { getGallery } from "@/src/features/cms/services/gallery";

export default async function GalleryPage() {
  const gallery = await getGallery();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galeri"
        description="Kelola galeri foto sekolah"
        action={
          <CreateButton
            href="/admin/cms/gallery/create"
            label="Tambah Galeri"
          />
        }
      />
      <GalleryTable data={gallery} />
    </div>
  );
}
