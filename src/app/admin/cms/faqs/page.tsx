import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { FaqTable } from "./_components/FaqTable";
import { getFaqs } from "@/src/features/cms/services/faqs";

export default async function FaqsPage() {
  const faqs = await getFaqs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQ"
        description="Kelola pertanyaan yang sering diajukan"
        action={
          <Button asChild>
            <Link href="/admin/cms/faqs/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah FAQ
            </Link>
          </Button>
        }
      />
      <FaqTable data={faqs} />
    </div>
  );
}
