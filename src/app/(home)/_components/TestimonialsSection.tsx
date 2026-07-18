import { TESTIMONIAL_TYPE_LABELS } from "@/src/lib/constants";
import type { Testimonial } from "@/src/features/cms/services/testimonials";

interface TestimonialItem {
  type: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
  isPrimary: boolean;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

const fallbackTestimonials: TestimonialItem[] = [
  {
    type: "Alumni",
    quote:
      "Berkat pendidikan di SMK Muhammadiyah 2 Cibiru, saya mendapatkan ilmu dan keterampilan yang sangat berguna. Sekarang saya bekerja sebagai Software Developer di perusahaan teknologi ternama.",
    name: "Rizki Ananda",
    role: "Alumni 2020 - Software Developer",
    initials: "RA",
    isPrimary: true,
  },
  {
    type: "Orang Tua",
    quote:
      "Saya sangat bersyukur menyekolahkan anak di sini. Selain akademik yang bagus, pembinaan karakter Islami membuat anak saya tumbuh menjadi pribadi yang berakhlak mulia.",
    name: "Ibu Siti Hartini",
    role: "Orang Tua Siswa Kelas XII",
    initials: "SH",
    isPrimary: false,
  },
  {
    type: "Alumni",
    quote:
      "Program magang yang difasilitasi sekolah membuka jalan karir saya. Langsung setelah lulus, saya diterima bekerja di tempat magang dengan posisi yang bagus.",
    name: "Dina Nurhaliza",
    role: "Alumni 2022 - Admin Finance",
    initials: "DN",
    isPrimary: true,
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word: string) => word[0].toUpperCase())
    .join("");
}

export default function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const items: TestimonialItem[] =
    testimonials && testimonials.length > 0
      ? testimonials.map((testimonial: Testimonial, index: number) => ({
          type: TESTIMONIAL_TYPE_LABELS[testimonial.type] ?? testimonial.type,
          quote: testimonial.quote,
          name: testimonial.name,
          role: testimonial.role,
          initials: getInitials(testimonial.name),
          isPrimary: index % 2 === 0,
        }))
      : fallbackTestimonials;

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Testimoni{" "}
            <span className="text-primary-600">Alumni & Orang Tua</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Apa kata mereka tentang pengalaman belajar di SMK Muhammadiyah 2
            Cibiru
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 relative flex flex-col"
            >
              <div className="absolute -top-4 left-8">
                <div
                  className={`w-10 h-10 ${
                    testimonial.isPrimary
                      ? "bg-primary-500"
                      : "bg-secondary-500"
                  } rounded-full flex items-center justify-center`}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
              </div>
              <div className="pt-4 flex flex-col flex-1">
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 shrink-0 ${
                      testimonial.isPrimary
                        ? "bg-gradient-to-br from-primary-400 to-primary-600"
                        : "bg-gradient-to-br from-secondary-400 to-secondary-600"
                    } rounded-full flex items-center justify-center text-white font-bold text-xl`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
              <span
                className={`absolute top-4 right-4 ${
                  testimonial.isPrimary
                    ? "bg-primary-100 text-primary-600"
                    : "bg-secondary-100 text-secondary-600"
                } text-xs font-semibold px-3 py-1 rounded-full`}
              >
                {testimonial.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
