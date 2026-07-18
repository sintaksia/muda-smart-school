import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { SocialLinksTable } from "./_components/SocialLinksTable";
import { getSocialLinks } from "@/src/features/cms/services/social-links";

export default async function SocialLinksPage() {
  const socialLinks = await getSocialLinks();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sosial Media"
        description="Kelola tautan sosial media sekolah"
        action={
          <CreateButton
            href="/admin/cms/social-links/create"
            label="Tambah Tautan"
          />
        }
      />
      <SocialLinksTable data={socialLinks} />
    </div>
  );
}
