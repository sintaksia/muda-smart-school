/* eslint-disable ds/off-palette -- categorical encoding: registration status per card; see docs/design_system.md §2.4 */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Users, Clock, CheckCircle, XCircle } from "lucide-react";

interface StatsCardsProps {
  stats: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Pendaftaran",
      value: stats.total,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
    },
    {
      title: "Menunggu Validasi",
      value: stats.pending,
      icon: Clock,
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Diterima",
      value: stats.accepted,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
    },
    {
      title: "Ditolak",
      value: stats.rejected,
      icon: XCircle,
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`rounded-full ${card.bgColor} p-2`}>
                <Icon className={`h-4 w-4 ${card.textColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {/* <p className="text-xs text-muted-foreground">
                                {card.title === "Total Pendaftaran"
                                    ? "Semua periode"
                                    : "Perlu tindakan admin"}
                            </p> */}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
