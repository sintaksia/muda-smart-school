import { Suspense } from "react";
import { PageHeader } from "./_components/PageHeader";
import { StatsCards } from "./_components/StatsCards";
import { DashboardCardSkeleton } from "./_components/dashboard/DashboardCardSkeleton";
import {
  RecentRegistrationsSection,
  ActionCenterSection,
} from "./_components/dashboard/DashboardSections";
import { getRegistrationStats } from "@/src/features/registration/services";

// Counts must reflect the live queue, never a cached snapshot.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stats = await getRegistrationStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Selamat datang di panel administrasi Muda Smart School."
      />

      <StatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<DashboardCardSkeleton />}>
          <RecentRegistrationsSection />
        </Suspense>
        <Suspense fallback={<DashboardCardSkeleton />}>
          <ActionCenterSection />
        </Suspense>
      </div>
    </div>
  );
}
