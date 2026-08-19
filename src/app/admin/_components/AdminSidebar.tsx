"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_VERSION } from "@/src/lib/constants";
import { Globe, School, Activity, Settings, UserCog } from "lucide-react";

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
} from "@/src/components/ui/sidebar";
import { UserMenu } from "./UserMenu";
import {
  SidebarCollapsibleGroup,
  SIDEBAR_GROUP_CLASS,
} from "./SidebarCollapsibleGroup";
import {
  mainMenuItems,
  cmsMenuItems,
  managementMenuItems,
  attendanceMenuItems,
  settingsMenuItems,
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
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary-600 text-white font-bold">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Muda Smart School</span>
            <span className="text-xs text-muted-foreground">
              Admin Panel{APP_VERSION && ` · v${APP_VERSION}`}
            </span>
          </div>
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

        <SidebarCollapsibleGroup
          label="Pengaturan"
          icon={Settings}
          items={settingsMenuItems}
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
