import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { ContactsForm } from "../_components/ContactsForm";
import { getContactById } from "@/src/features/cms/services/contacts";

interface EditContactPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContactPage({
  params,
}: EditContactPageProps) {
  const { id } = await params;
  const contact = await getContactById(id);

  if (!contact) {
    notFound();
  }

  const defaultValues = {
    name: contact.name,
    value: contact.value,
    type: contact.type,
    description: contact.description ?? undefined,
    order: contact.order,
    isActive: contact.isActive,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Kontak"
        description={`Ubah data kontak ${contact.name}`}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/cms/contacts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
        }
      />
      <ContactsForm defaultValues={defaultValues} contactId={id} />
    </div>
  );
}
