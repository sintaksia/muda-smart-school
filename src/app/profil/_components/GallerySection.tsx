import Image from "next/image";
import { getActiveGallery } from "@/src/features/cms/services/gallery";

export default async function GallerySection() {
  // Ambil semua gallery yang aktif dari database
  const galleries = await getActiveGallery();

  const limitedGalleries = galleries.slice(0, 4);

  // Jika tidak ada data, tampilkan default static content
  if (limitedGalleries.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Galeri Sekolah
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
              Suasana Belajar di{" "}
              <span className="text-primary-600">
                SMK Muhammadiyah 2 Cibiru
              </span>
            </h2>
          </div>

          {/* Masonry Grid - Default */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 row-span-2">
              <div className="relative h-full min-h-[400px] rounded-lg overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500">Belum ada gambar di galeri</p>
                </div>
              </div>
            </div>
            <div className="col-span-1">
              <div className="relative aspect-square rounded-md overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              </div>
            </div>
            <div className="col-span-1">
              <div className="relative aspect-square rounded-md overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              </div>
            </div>
            <div className="col-span-2">
              <div className="relative aspect-video rounded-md overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Masonry Layout Gallery

  return (
    <section className="py-16 md:py-24 bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Galeri Sekolah
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Suasana Belajar di{" "}
            <span className="text-primary-600">SMK Muhammadiyah 2 Cibiru</span>
          </h2>
        </div>

        {/* Masonry Grid - Dinamis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {limitedGalleries.map((gallery, index) => {
            // Tentukan layout berdasarkan index
            let colSpan = "col-span-1";
            let rowSpan = "";
            let aspectClass = "aspect-square";
            let minHeight = "";

            if (index === 0) {
              // Gambar pertama: besar (col-span-2 row-span-2)
              colSpan = "col-span-2";
              rowSpan = "row-span-2";
              aspectClass = "";
              minHeight = "min-h-[650px]";
            } else if (index === 1 || index === 2) {
              // Gambar kedua dan ketiga: kotak kecil
              colSpan = "col-span-1";
              aspectClass = "aspect-square";
            } else if (index === 3) {
              // Gambar keempat: panjang (col-span-2)
              colSpan = "col-span-2";
              aspectClass = "aspect-video";
            } else if (index % 4 === 0) {
              // Setiap 4 gambar, mulai pattern baru
              colSpan = "col-span-2";
              aspectClass = "aspect-video";
            } else {
              // Default: kotak kecil
              colSpan = "col-span-1";
              aspectClass = "aspect-square";
            }

            return (
              <div key={gallery.id} className={`${colSpan} ${rowSpan}`}>
                <div
                  className={`relative ${aspectClass} ${minHeight} rounded-md overflow-hidden group`}
                >
                  <Image
                    src={gallery.image}
                    alt={gallery.title}
                    fill
                    sizes={
                      colSpan === "col-span-2"
                        ? "(max-width: 768px) 100vw, 50vw"
                        : "(max-width: 768px) 50vw, 25vw"
                    }
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white font-semibold">{gallery.title}</p>
                    {gallery.description && (
                      <p className="text-white/90 text-sm mt-1">
                        {gallery.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
