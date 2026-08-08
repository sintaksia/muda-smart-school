import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/src/components/ui/sidebar";
import { AdminSidebar } from "./_components/AdminSidebar";
import { Separator } from "@/src/components/ui/separator";
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
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 print:hidden">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium">Admin Panel</span>
        </header>
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
