import type { Achievement } from "@prisma/client";
import PrestasiCard from "./PrestasiCard";

interface PrestasiListSectionProps {
  achievements: Achievement[];
}

export default function PrestasiListSection({
  achievements,
}: PrestasiListSectionProps) {
  if (achievements.length === 0) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <p className="text-gray-500 text-lg">Belum ada data prestasi.</p>
        </div>
      </section>
    );
  }

  const juara1Count = achievements.filter(
    (a) => a.medalType === "GOLD" || a.medalType === "FIRST_PLACE",
  ).length;
  const juara2Count = achievements.filter(
    (a) => a.medalType === "SILVER" || a.medalType === "SECOND_PLACE",
  ).length;
  const juara3Count = achievements.filter(
    (a) => a.medalType === "BRONZE" || a.medalType === "THIRD_PLACE",
  ).length;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {juara1Count}
            </div>
            <div className="text-sm text-yellow-700">Juara 1 / Emas</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
            <div className="text-3xl font-bold text-gray-600">
              {juara2Count}
            </div>
            <div className="text-sm text-gray-700">Juara 2 / Perak</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {juara3Count}
            </div>
            <div className="text-sm text-orange-700">Juara 3 / Perunggu</div>
          </div>
          <div className="bg-primary-50 border border-primary-200 rounded-md p-4 text-center">
            <div className="text-3xl font-bold text-primary-600">
              {achievements.length}
            </div>
            <div className="text-sm text-primary-700">Total Prestasi</div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <PrestasiCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </section>
  );
}
