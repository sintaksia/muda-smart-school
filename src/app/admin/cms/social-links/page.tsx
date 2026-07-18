import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
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
          <Button asChild>
            <Link href="/admin/cms/social-links/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Tautan
            </Link>
          </Button>
        }
      />
      <SocialLinksTable data={socialLinks} />
    </div>
  );
}
