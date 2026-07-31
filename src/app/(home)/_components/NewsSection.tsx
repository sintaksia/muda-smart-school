import Image from "next/image";
import Link from "next/link";
import { getPublishedNews } from "@/src/features/cms/services/news";

const categoryColors: Record<string, string> = {
  PENGUMUMAN: "bg-green-100 text-green-700",
  KEGIATAN: "bg-primary-100 text-primary-700",
  PRESTASI: "bg-yellow-100 text-yellow-700",
  BERITA: "bg-gray-100 text-gray-700",
};

export default async function NewsSection() {
  const news = await getPublishedNews(4);
  const [featured, ...sidebarNews] = news;

  if (!featured) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Berita & <span className="text-primary-600">Pengumuman</span>
            </h2>
            <p className="text-lg text-gray-600">
              Informasi terbaru seputar kegiatan dan pengumuman sekolah
            </p>
          </div>
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            Lihat Semua
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured News */}
          <div className="lg:col-span-2">
            <Link
              href={`/berita/${featured.slug}`}
              className="group relative block h-[400px] rounded-lg overflow-hidden"
            >
              <Image
                src={featured.image || "/gambar-1.jpg"}
                alt={featured.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  {featured.category}
                </span>
                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                  {featured.title}
                </h3>
                {featured.excerpt && (
                  <p className="text-white/80 mb-4 line-clamp-2">
                    {featured.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-white/60 text-sm">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(
                      featured.publishedAt || featured.createdAt,
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* News List */}
          <div className="space-y-4">
            {sidebarNews.map((item) => {
              const colors =
                categoryColors[item.category] || "bg-gray-100 text-gray-700";
              return (
                <Link
                  key={item.id}
                  href={`/berita/${item.slug}`}
                  className="group flex gap-4 p-4 bg-gray-50 rounded-md hover:bg-primary-50 transition-colors"
                >
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-sm overflow-hidden">
                    <Image
                      src={item.image || "/gambar-1.jpg"}
                      alt={item.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`inline-block ${colors} text-[10px] font-bold px-2 py-0.5 rounded-full mb-2`}
                    >
                      {item.category}
                    </span>
                    <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(
                        item.publishedAt || item.createdAt,
                      ).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
