import { CTAGridBackground } from "@/src/components/common/CTAGridBackground";

const features = ["Terakreditasi A", "5 Program Keahlian", "Beasiswa Tersedia"];

export default function CTABanner() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
      {/* Decorative elements */}
      <CTAGridBackground />

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 text-sm font-bold px-4 py-2 rounded-full mb-6 animate-pulse">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            PENDAFTARAN DIBUKA
          </span>

          {/* Main Heading */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Bergabunglah Bersama Kami di
            <br />
            <span className="text-yellow-400">Tahun Ajaran 2026/2027</span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Wujudkan masa depan cemerlang bersama SMK Muhammadiyah 2 Cibiru.
            Fasilitas lengkap, pengajar profesional, dan program keahlian yang
            relevan dengan industri.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-white/90"
              >
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {feature}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/registrasi"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold text-lg px-8 py-4 rounded-sm transition-all duration-300 hover:scale-105"
            >
              Daftar Sekarang
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
            </a>
            <a
              href="#info-pendaftaran"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-lg px-8 py-4 rounded-sm border-2 border-white/30 transition-all duration-300"
            >
              Info Pendaftaran
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
