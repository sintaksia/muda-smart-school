"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_VERSION } from "@/src/lib/constants";
import { Globe, School, Activity, UserCog } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
  SidebarTrigger,
} from "@/src/components/ui/sidebar";
import { UserMenu } from "./UserMenu";
import { SidebarCollapsibleGroup } from "./SidebarCollapsibleGroup";
import { SIDEBAR_GROUP_CLASS } from "./sidebarGroup";
import {
  mainMenuItems,
  cmsMenuItems,
  managementMenuItems,
  attendanceMenuItems,
  userManagementItems,
} from "./sidebarNavItems";
import type { SessionUser } from "@/src/features/auth/types";
import { canManageUsers } from "@/src/features/auth/utils/permissions";

interface AdminSidebarProps {
  user: SessionUser;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const showUserManagement = canManageUsers(user.role);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary-600 text-white font-bold group-data-[collapsible=icon]:hidden">
            M
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">
              Muda Smart School
            </span>
            <span className="text-xs text-muted-foreground">
              Admin Panel{APP_VERSION && ` · v${APP_VERSION}`}
            </span>
          </div>
          {/* Sidebar-scoped hover: the default ghost `hover:bg-accent` resolves
              to the blue --accent ramp, which clashes with the sidebar tint. */}
          <SidebarTrigger className="ml-auto hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:ml-0" />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1 py-2">
        {/* Menu Utama */}
        <SidebarGroup className={SIDEBAR_GROUP_CLASS}>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarCollapsibleGroup
          label="CMS - Website"
          icon={Globe}
          items={cmsMenuItems}
        />

        <SidebarCollapsibleGroup
          label="Manajemen"
          icon={School}
          items={managementMenuItems}
        />

        <SidebarCollapsibleGroup
          label="Absensi & Kredit"
          icon={Activity}
          items={attendanceMenuItems}
        />

        {showUserManagement && (
          <SidebarCollapsibleGroup
            label="Administrasi"
            icon={UserCog}
            items={userManagementItems}
          />
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <UserMenu user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
