"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface HeroSlideData {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  ctaText: string | null;
  ctaLink: string | null;
  order: number;
}

interface HeroBannerProps {
  slides: HeroSlideData[];
}

export default function HeroBanner({ slides }: HeroBannerProps) {
  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full h-[500px] md:h-[600px]">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-white/50 !w-3 !h-3",
          bulletActiveClass: "!bg-white !w-8 !rounded-full",
        }}
        loop={slides.length > 1}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="100vw"
                priority={index === 0}
                className="object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

              {/* Content */}
              <div className="absolute inset-0 flex items-end">
                <div className="w-full p-8 md:p-12 pb-16 md:pb-20">
                  <div className="max-w-7xl mx-auto">
                    {slide.ctaText && slide.ctaLink ? (
                      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
                            {slide.title}
                          </h2>
                          {slide.subtitle && (
                            <p className="text-lg md:text-xl text-white/90 max-w-2xl drop-shadow-md">
                              {slide.subtitle}
                            </p>
                          )}
                        </div>
                        <a
                          href={slide.ctaLink}
                          className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold text-lg px-8 py-4 rounded-sm transition-all duration-300 hover:scale-105"
                        >
                          {slide.ctaText}
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
                      </div>
                    ) : (
                      <>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
                          {slide.title}
                        </h2>
                        {slide.subtitle && (
                          <p className="text-lg md:text-xl text-white/90 max-w-2xl drop-shadow-md">
                            {slide.subtitle}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
