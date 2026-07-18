interface FaqItem {
  question: string;
  answer: string;
}

const fallbackFaqItems: FaqItem[] = [
  {
    question: "Bagaimana cara mendaftar di SMK Muhammadiyah 2 Cibiru?",
    answer:
      "Pendaftaran dapat dilakukan secara online melalui halaman pendaftaran atau langsung datang ke sekolah. Siapkan dokumen seperti ijazah SMP/MTs, akta kelahiran, kartu keluarga, dan pas foto.",
  },
  {
    question: "Apa saja jurusan yang tersedia?",
    answer:
      "Kami memiliki 5 program keahlian: Teknik Otomotif, PPLG (Pengembangan Perangkat Lunak dan Gim), TJKT (Teknik Jaringan Komputer dan Telekomunikasi), MPLB (Manajemen Perkantoran dan Layanan Bisnis), dan AKL (Akuntansi dan Keuangan Lembaga).",
  },
  {
    question: "Jam operasional sekolah?",
    answer:
      "Senin - Jumat: 07.00 - 15.00 WIB. Sabtu: 07.00 - 12.00 WIB (untuk kegiatan ekstrakurikuler). Kantor administrasi buka Senin - Jumat: 08.00 - 15.00 WIB.",
  },
];

interface FAQSectionProps {
  faqs?: FaqItem[];
  whatsappHref?: string;
}

export default function FAQSection({
  faqs,
  whatsappHref = "https://wa.me/6282120091616",
}: FAQSectionProps) {
  const faqItems = faqs && faqs.length > 0 ? faqs : fallbackFaqItems;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Pertanyaan{" "}
            <span className="text-primary-600">Yang Sering Diajukan</span>
          </h2>
          <p className="text-lg text-neutral-600">
            Temukan jawaban untuk pertanyaan yang paling sering diajukan
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((faq, index) => (
            <div
              key={index}
              className="bg-neutral-50 rounded-2xl p-6 hover:bg-primary-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-neutral-900 mb-2 flex items-start gap-3">
                <span className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                  {index + 1}
                </span>
                {faq.question}
              </h3>
              <p className="text-neutral-600 ml-10">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-neutral-600 mb-4">Masih punya pertanyaan lain?</p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Hubungi via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
