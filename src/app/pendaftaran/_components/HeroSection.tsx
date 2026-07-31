import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-900 via-primary-700 to-primary-900 py-20 md:py-28 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl">
          <svg className="w-full h-full opacity-5" viewBox="0 0 200 200">
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-700/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 pb-8 md:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
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
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Informasi <span className="text-yellow-400">Pendaftaran</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-200 leading-relaxed">
            Sistem Penerimaan Murid Baru Tahun Ajaran 2026/2027
          </p>
        </div>
      </div>
    </section>
  );
}
