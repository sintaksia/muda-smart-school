import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { SocialLinksForm } from "../_components/SocialLinksForm";
import { getSocialLinkById } from "@/src/features/cms/services/social-links";

interface EditSocialLinkPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSocialLinkPage({
  params,
}: EditSocialLinkPageProps) {
  const { id } = await params;
  const socialLink = await getSocialLinkById(id);

  if (!socialLink) {
    notFound();
  }

  const defaultValues = {
    platform: socialLink.platform,
    url: socialLink.url,
    username: socialLink.username ?? undefined,
    order: socialLink.order,
    isActive: socialLink.isActive,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Tautan Sosial"
        description={`Ubah tautan ${socialLink.platform}`}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/cms/social-links">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
        }
      />
      <SocialLinksForm defaultValues={defaultValues} socialLinkId={id} />
    </div>
  );
}
