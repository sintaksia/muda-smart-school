import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { FaqForm } from "../_components/FaqForm";

export default function CreateFaqPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah FAQ"
        description="Buat pertanyaan baru"
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/cms/faqs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
        }
      />
      <FaqForm />
    </div>
  );
}
