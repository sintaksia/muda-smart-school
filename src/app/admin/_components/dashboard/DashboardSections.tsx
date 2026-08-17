import { getRecentRegistrations } from "@/src/features/registration/services";
import { getAdminActionItems } from "@/src/features/dashboard/services/actionItems";
import { RecentRegistrationsCard } from "./RecentRegistrationsCard";
import { ActionCenterCard } from "./ActionCenterCard";

/**
 * Each section fetches its own data so the dashboard can stream them
 * independently — a slow aggregate never blocks the rest of the page.
 */
export async function RecentRegistrationsSection() {
  const registrations = await getRecentRegistrations();
  return <RecentRegistrationsCard registrations={registrations} />;
}

export async function ActionCenterSection() {
  const counts = await getAdminActionItems();
  return <ActionCenterCard counts={counts} />;
}
