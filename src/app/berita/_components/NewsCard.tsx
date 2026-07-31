import Image from "next/image";
import Link from "next/link";
import type { News } from "@prisma/client";

const categoryColors: Record<string, string> = {
  PENGUMUMAN: "bg-green-100 text-green-700",
  KEGIATAN: "bg-primary-100 text-primary-700",
  PRESTASI: "bg-yellow-100 text-yellow-700",
  BERITA: "bg-gray-100 text-gray-700",
};

interface NewsCardProps {
  news: News;
}

export default function NewsCard({ news }: NewsCardProps) {
  const colors = categoryColors[news.category] || "bg-gray-100 text-gray-700";

  return (
    <Link
      href={`/berita/${news.slug}`}
      className="group block overflow-hidden rounded-md bg-white border border-gray-100 hover:shadow-sm transition-shadow"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={news.image || "/gambar-1.jpg"}
          alt={news.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${colors}`}
          >
            {news.category}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(news.publishedAt || news.createdAt).toLocaleDateString(
              "id-ID",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            )}
          </span>
        </div>
        <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
          {news.title}
        </h3>
        {news.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2">{news.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
