import { Trophy } from "lucide-react";

export default function PrestasiHeroSection() {
  return (
    <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-sm flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-900" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Prestasi Siswa
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Raihan prestasi gemilang siswa-siswi kami di berbagai kompetisi dan
          olimpiade tingkat regional hingga nasional
        </p>
      </div>
    </section>
  );
}
