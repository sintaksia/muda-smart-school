import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
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
          <CreateButton href="/admin/cms/faqs/create" label="Tambah FAQ" />
        }
      />
      <FaqTable data={faqs} />
    </div>
  );
}
