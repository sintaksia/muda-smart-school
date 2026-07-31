export default function HeroSection() {
  return (
    <section className="relative bg-primary-900 py-20 md:py-28 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-700/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-yellow-400 text-sm font-medium">
              Hubungi Kami
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Kami Siap <span className="text-yellow-400">Membantu</span> Anda
          </h1>
          <p className="text-lg md:text-xl text-primary-200 leading-relaxed">
            Punya pertanyaan tentang pendaftaran, program keahlian, atau
            informasi lainnya? Jangan ragu untuk menghubungi kami.
          </p>
        </div>
      </div>
    </section>
  );
}
