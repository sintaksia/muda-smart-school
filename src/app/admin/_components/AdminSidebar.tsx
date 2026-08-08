"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_VERSION, ENTITY_LABELS } from "@/src/lib/constants";
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
  Share2,
  IdCard,
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
import {
  SidebarCollapsibleGroup,
  SIDEBAR_GROUP_CLASS,
  type SidebarNavItem,
} from "./SidebarCollapsibleGroup";
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
const cmsMenuItems: SidebarNavItem[] = [
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
    title: "Kontak",
    url: "/admin/cms/contacts",
    icon: Phone,
  },
  {
    title: "Sosial Media",
    url: "/admin/cms/social-links",
    icon: Share2,
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
const managementMenuItems: SidebarNavItem[] = [
  {
    title: ENTITY_LABELS.STUDENT,
    url: "/admin/siswa",
    icon: Users,
  },
  {
    title: `Kartu ${ENTITY_LABELS.STUDENT}`,
    url: "/admin/siswa/kartu",
    icon: IdCard,
  },
  {
    title: ENTITY_LABELS.TEACHER,
    url: "/admin/guru",
    icon: GraduationCap,
  },
  {
    title: ENTITY_LABELS.CLASS,
    url: "/admin/kelas",
    icon: School,
  },
  {
    title: "Jadwal",
    url: "/admin/jadwal",
    icon: Calendar,
  },
  {
    title: ENTITY_LABELS.SUBJECT,
    url: "/admin/mapel",
    icon: BookOpen,
  },
];

// Absensi & Skor Kredit
const attendanceMenuItems: SidebarNavItem[] = [
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
const settingsMenuItems: SidebarNavItem[] = [
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
const userManagementItems: SidebarNavItem[] = [
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
