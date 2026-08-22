import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/src/components/ui/sidebar";
import { AdminSidebar } from "./_components/AdminSidebar";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  // Check if user can access admin panel
  if (!canAccessAdmin(user.role)) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      {/* Chrome is hidden when printing (e.g. the student card sheet). */}
      <div className="print:hidden">
        <AdminSidebar user={user} />
      </div>
      <SidebarInset>
        {/* The sidebar owns its own toggle; on mobile it collapses off-canvas,
            so a slim bar keeps a way back to it. */}
        <header className="flex h-14 shrink-0 items-center border-b px-4 md:hidden print:hidden">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
