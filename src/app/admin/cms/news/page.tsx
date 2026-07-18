import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { NewsTable } from "./_components/NewsTable";
import { getNews } from "@/src/features/cms/services/news";

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Berita"
        description="Kelola berita dan pengumuman"
        action={
          <CreateButton href="/admin/cms/news/create" label="Tambah Berita" />
        }
      />
      <NewsTable data={news} />
    </div>
  );
}
