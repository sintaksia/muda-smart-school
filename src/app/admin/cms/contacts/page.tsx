import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { ContactsTable } from "./_components/ContactsTable";
import { getContacts } from "@/src/features/cms/services/contacts";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kontak"
        description="Kelola kontak sekolah"
        action={
          <CreateButton
            href="/admin/cms/contacts/create"
            label="Tambah Kontak"
          />
        }
      />
      <ContactsTable data={contacts} />
    </div>
  );
}
