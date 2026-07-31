import { Camera, Images } from "lucide-react";

interface GaleriHeroSectionProps {
  totalPhotos: number;
  categoryCount: number;
}

export default function GaleriHeroSection({
  totalPhotos,
  categoryCount,
}: GaleriHeroSectionProps) {
  return (
    <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-sm flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
          Galeri Sekolah
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
          Dokumentasi kegiatan, fasilitas, dan momen berharga di SMK
          Muhammadiyah 2 Cibiru
        </p>

        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-gray-300">
            <Images className="w-5 h-5 text-primary-400" />
            <span className="text-2xl font-bold text-white">{totalPhotos}</span>
            <span className="text-sm">Foto</span>
          </div>
          <div className="w-px h-8 bg-gray-600" />
          <div className="flex items-center gap-2 text-gray-300">
            <Camera className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">
              {categoryCount}
            </span>
            <span className="text-sm">Kategori</span>
          </div>
        </div>
      </div>
    </section>
  );
}
