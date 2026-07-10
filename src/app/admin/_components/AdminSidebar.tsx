"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Settings,
  Bell,
  Calendar,
  BookOpen,
  Globe,
  Image,
  MessageSquareQuote,
  Newspaper,
  Trophy,
  HelpCircle,
  Building2,
  Phone,
  Layers,
  School,
  Activity,
  UserCog,
  Bot,
} from "lucide-react";

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
import type { SessionUser } from "@/src/features/auth/types";
import { canManageUsers } from "@/src/features/auth/utils/permissions";

// Menu Utama
const mainMenuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Pendaftaran",
    url: "/admin/registrations",
    icon: FileText,
  },
];

// CMS - Konten Website
const cmsMenuItems = [
  {
    title: "Hero Slider",
    url: "/admin/cms/hero-slides",
    icon: Layers,
  },
  {
    title: "Program Keahlian",
    url: "/admin/cms/programs",
    icon: School,
  },
  {
    title: "Berita",
    url: "/admin/cms/news",
    icon: Newspaper,
  },
  {
    title: "Testimoni",
    url: "/admin/cms/testimonials",
    icon: MessageSquareQuote,
  },
  {
    title: "Prestasi",
    url: "/admin/cms/achievements",
    icon: Trophy,
  },
  {
    title: "Galeri",
    url: "/admin/cms/gallery",
    icon: Image,
  },
  {
    title: "Fasilitas",
    url: "/admin/cms/facilities",
    icon: Building2,
  },
  {
    title: "Ekstrakurikuler",
    url: "/admin/cms/extracurriculars",
    icon: Activity,
  },
  {
    title: "FAQ",
    url: "/admin/cms/faqs",
    icon: HelpCircle,
  },
  {
    title: "Kontak & Sosmed",
    url: "/admin/cms/contacts",
    icon: Phone,
  },
  {
    title: "Profil Sekolah",
    url: "/admin/cms/school-profile",
    icon: Globe,
  },
  {
    title: "AI Chat",
    url: "/admin/cms/ai-chat",
    icon: Bot,
  },
];

// Manajemen Sekolah
const managementMenuItems = [
  {
    title: "Siswa",
    url: "/admin/siswa",
    icon: Users,
  },
  {
    title: "Guru",
    url: "/admin/guru",
    icon: GraduationCap,
  },
  {
    title: "Kelas",
    url: "/admin/kelas",
    icon: School,
  },
  {
    title: "Jadwal",
    url: "/admin/jadwal",
    icon: Calendar,
  },
  {
    title: "Mata Pelajaran",
    url: "/admin/mapel",
    icon: BookOpen,
  },
];

// Absensi & Skor Kredit
const attendanceMenuItems = [
  {
    title: "Sesi Hari Ini",
    url: "/admin/absensi",
    icon: Activity,
  },
  {
    title: "Izin / Sakit",
    url: "/admin/absensi/izin",
    icon: FileText,
  },
  {
    title: "Absensi Guru",
    url: "/admin/absensi/guru",
    icon: GraduationCap,
  },
  {
    title: "Skor Kredit",
    url: "/admin/absensi/kredit",
    icon: Trophy,
  },
  {
    title: "Pengaturan Absensi",
    url: "/admin/absensi/pengaturan",
    icon: Settings,
  },
];

// Pengaturan
const settingsMenuItems = [
  {
    title: "Notifikasi",
    url: "/admin/notifikasi",
    icon: Bell,
  },
  {
    title: "Pengaturan",
    url: "/admin/pengaturan",
    icon: Settings,
  },
];

// User Management (Super Admin only)
const userManagementItems = [
  {
    title: "Kelola User",
    url: "/admin/users",
    icon: UserCog,
  },
];

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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Muda Smart School</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Menu Utama */}
        <SidebarGroup>
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

        {/* CMS - Konten Website */}
        <SidebarGroup>
          <SidebarGroupLabel>CMS - Website</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {cmsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.url ||
                      pathname.startsWith(item.url + "/")
                    }
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

        {/* Manajemen Sekolah */}
        <SidebarGroup>
          <SidebarGroupLabel>Manajemen</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.url ||
                      pathname.startsWith(item.url + "/")
                    }
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

        {/* Absensi & Skor Kredit */}
        <SidebarGroup>
          <SidebarGroupLabel>Absensi & Kredit</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {attendanceMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.url ||
                      (item.url !== "/admin/absensi" &&
                        pathname.startsWith(item.url + "/"))
                    }
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

        {/* Pengaturan */}
        <SidebarGroup>
          <SidebarGroupLabel>Pengaturan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.url ||
                      pathname.startsWith(item.url + "/")
                    }
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

        {/* User Management - Super Admin Only */}
        {showUserManagement && (
          <SidebarGroup>
            <SidebarGroupLabel>Administrasi</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === item.url ||
                        pathname.startsWith(item.url + "/")
                      }
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
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <UserMenu user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
