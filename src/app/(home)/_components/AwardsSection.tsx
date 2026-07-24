import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHighlightedAchievements } from "@/src/features/cms/services/achievements";
import type { Achievement } from "@/src/features/cms/services/achievements";

export default async function AwardsSection() {
  const achievements: Achievement[] = await getHighlightedAchievements(5);
  const goldCount = achievements.filter(
    (a: Achievement) => a.medalType === "GOLD" || a.medalType === "FIRST_PLACE",
  ).length;
  const achievementsWithImage = achievements.filter(
    (a: Achievement) => a.image,
  );

  return (
    <section className="py-14 md:py-16 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-yellow-900"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <span className="text-yellow-400 font-semibold text-sm">
                Prestasi
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Raihan Prestasi Gemilang
            </h2>
          </div>
          {goldCount > 0 && (
            <p className="text-gray-400 text-sm md:text-right max-w-xs">
              {goldCount} Juara 1 / Emas
            </p>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Achievements List */}
          <div className="lg:col-span-3 space-y-3">
            {achievements.map((achievement) => {
              const isGold =
                achievement.medalType === "GOLD" ||
                achievement.medalType === "FIRST_PLACE";
              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-4 bg-white/5 backdrop-blur rounded-xl p-4 border ${
                    isGold
                      ? "border-yellow-500/20 hover:border-yellow-500/40"
                      : "border-primary-500/20 hover:border-primary-500/40"
                  } transition-colors`}
                >
                  <div
                    className={`w-10 h-10 ${
                      isGold
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                        : "bg-gradient-to-br from-primary-400 to-primary-600"
                    } rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    {isGold ? (
                      <svg
                        className="w-5 h-5 text-yellow-900"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">
                        {achievement.title}
                      </h3>
                      <span
                        className={`text-[10px] ${
                          achievement.level === "NATIONAL"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        } px-2 py-0.5 rounded-full font-bold`}
                      >
                        {achievement.level}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{achievement.event}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Photo Grid */}
          {achievementsWithImage.length > 0 && (
            <div
              className={`lg:col-span-2 grid gap-2 ${
                achievementsWithImage.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-2"
              }`}
            >
              {achievementsWithImage
                .slice(0, 4)
                .map((item: Achievement, index: number) => {
                  const total = Math.min(achievementsWithImage.length, 4);
                  const isLastOdd = total === 3 && index === 2;
                  return (
                    <div
                      key={item.id}
                      className={`group relative rounded-lg overflow-hidden ${
                        total === 1
                          ? "aspect-[16/9]"
                          : isLastOdd
                            ? "col-span-2 aspect-[16/9]"
                            : "aspect-[4/3]"
                      }`}
                    >
                      <Image
                        src={item.image!}
                        alt={item.title}
                        fill
                        sizes="(max-width: 1024px) 50vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Lihat Lainnya Button */}
        <div className="mt-8 text-center">
          <Link
            href="/prestasi"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-semibold rounded-xl transition-colors"
          >
            Lihat Semua Prestasi
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
