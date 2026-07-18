import { ArrowDown } from "lucide-react";
import { CTAGridBackground } from "@/src/components/common/CTAGridBackground";

export default function CTABanner() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
      {/* Decorative elements */}
      <CTAGridBackground />

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center">
          {/* Main Heading */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Bergabunglah Bersama Kami di
            <br />
            <span className="text-yellow-400">Tahun Ajaran 2026/2027</span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Lengkapi formulir pendaftaran di bawah ini sebagai langkah awal
            menjadi bagian dari SMK Muhammadiyah 2 Cibiru.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#formPendaftaran"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-yellow-400/25"
            >
              Daftar Sekarang
              <ArrowDown className="size-6 text-yellow-900" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
