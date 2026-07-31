import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { News } from "@prisma/client";

const categoryColors: Record<string, string> = {
  PENGUMUMAN: "bg-green-100 text-green-700",
  KEGIATAN: "bg-primary-100 text-primary-700",
  PRESTASI: "bg-yellow-100 text-yellow-700",
  BERITA: "bg-gray-100 text-gray-700",
};

interface NewsDetailContentProps {
  news: News;
}

export default function NewsDetailContent({ news }: NewsDetailContentProps) {
  const colors = categoryColors[news.category] || "bg-gray-100 text-gray-700";

  return (
    <article className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Back Link */}
        <Link
          href="/berita"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Berita
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${colors}`}
            >
              {news.category}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(news.publishedAt || news.createdAt).toLocaleDateString(
                "id-ID",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              )}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {news.title}
          </h1>
        </div>

        {/* Featured Image */}
        {news.image && (
          <div className="relative w-full h-[300px] md:h-[450px] rounded-lg overflow-hidden mb-8">
            <Image
              src={news.image}
              alt={news.title}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="tiptap-content text-gray-700"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </div>
    </article>
  );
}
