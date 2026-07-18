import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { FaqForm } from "../_components/FaqForm";
import { getFaqById } from "@/src/features/cms/services/faqs";

interface EditFaqPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFaqPage({ params }: EditFaqPageProps) {
  const { id } = await params;
  const faq = await getFaqById(id);

  if (!faq) {
    notFound();
  }

  const defaultValues = {
    question: faq.question,
    answer: faq.answer,
    order: faq.order,
    isActive: faq.isActive,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit FAQ"
        description="Ubah data pertanyaan"
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/cms/faqs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
        }
      />
      <FaqForm defaultValues={defaultValues} faqId={id} />
    </div>
  );
}
