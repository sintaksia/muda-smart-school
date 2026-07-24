import Image from "next/image";
import type { Achievement } from "@prisma/client";
import { Trophy, Award, Medal } from "lucide-react";

interface PrestasiCardProps {
  achievement: Achievement;
}

export default function PrestasiCard({ achievement }: PrestasiCardProps) {
  const getMedalInfo = (medalType: string | null) => {
    switch (medalType) {
      case "GOLD":
      case "FIRST_PLACE":
        return {
          icon: Trophy,
          bgColor: "bg-gradient-to-br from-yellow-400 to-amber-500",
          iconColor: "text-yellow-900",
          borderColor: "border-yellow-300",
          cardBg: "bg-yellow-50",
        };
      case "SILVER":
      case "SECOND_PLACE":
        return {
          icon: medalType === "SILVER" ? Medal : Trophy,
          bgColor: "bg-gradient-to-br from-gray-300 to-gray-400",
          iconColor: "text-gray-700",
          borderColor: "border-gray-300",
          cardBg: "bg-gray-50",
        };
      case "BRONZE":
      case "THIRD_PLACE":
        return {
          icon: medalType === "BRONZE" ? Medal : Trophy,
          bgColor: "bg-gradient-to-br from-orange-400 to-orange-500",
          iconColor: "text-orange-900",
          borderColor: "border-orange-300",
          cardBg: "bg-orange-50",
        };
      case "HONORABLE_MENTION_1":
      case "HONORABLE_MENTION_2":
      case "HONORABLE_MENTION_3":
        return {
          icon: Award,
          bgColor: "bg-gradient-to-br from-primary-400 to-primary-500",
          iconColor: "text-white",
          borderColor: "border-primary-200",
          cardBg: "bg-primary-50",
        };
      default:
        return {
          icon: Award,
          bgColor: "bg-gradient-to-br from-primary-400 to-primary-600",
          iconColor: "text-white",
          borderColor: "border-primary-200",
          cardBg: "bg-white",
        };
    }
  };

  const medalInfo = getMedalInfo(achievement.medalType);
  const IconComponent = medalInfo.icon;

  return (
    <div
      className={`${medalInfo.cardBg} border ${medalInfo.borderColor} rounded-xl overflow-hidden hover:shadow-lg transition-shadow`}
    >
      {achievement.image && (
        <div className="relative aspect-video">
          <Image
            src={achievement.image}
            alt={achievement.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 ${medalInfo.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <IconComponent className={`w-5 h-5 ${medalInfo.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-gray-900">
                {achievement.title}
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">{achievement.event}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  achievement.level === "NATIONAL"
                    ? "bg-red-100 text-red-700"
                    : achievement.level === "PROVINCE"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {achievement.level}
              </span>
              <span className="text-xs text-gray-500">{achievement.year}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
