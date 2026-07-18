import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { SocialLinksForm } from "../_components/SocialLinksForm";

export default function CreateSocialLinkPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Tautan Sosial"
        description="Buat tautan sosial media baru"
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/cms/social-links">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
        }
      />
      <SocialLinksForm />
    </div>
  );
}
