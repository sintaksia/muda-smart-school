import Link from "next/link";

export default function CTABanner() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Siap Bergabung Bersama Kami?
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          Daftarkan diri Anda sekarang dan mulai perjalanan menuju masa depan
          yang cerah bersama SMK Muhammadiyah 2 Cibiru.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
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
          </Link>
          <Link
            href="/jurusan"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-lg px-8 py-4 rounded-sm border-2 border-white/30 transition-all duration-300"
          >
            Lihat Program Keahlian
          </Link>
        </div>
      </div>
    </section>
  );
}
