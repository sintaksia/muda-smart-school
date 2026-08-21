import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Settings,
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
  ClipboardList,
} from "lucide-react";

import { ENTITY_LABELS } from "@/src/lib/constants";
import type { SidebarNavItem } from "./SidebarCollapsibleGroup";

// Menu Utama
export const mainMenuItems: SidebarNavItem[] = [
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
export const cmsMenuItems: SidebarNavItem[] = [
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
export const managementMenuItems: SidebarNavItem[] = [
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

// Absensi & Skor Kredit — split into a Siswa run and a Guru run so the two
// halves read as peers instead of one of them looking absent.
export const attendanceMenuItems: SidebarNavItem[] = [
  {
    title: "Sesi Hari Ini",
    url: "/admin/absensi",
    icon: Activity,
  },
  {
    section: ENTITY_LABELS.STUDENT,
    title: "Rekap Kehadiran",
    url: "/admin/absensi/siswa",
    icon: ClipboardList,
  },
  {
    title: "Izin / Sakit",
    url: "/admin/absensi/izin",
    icon: FileText,
  },
  {
    section: ENTITY_LABELS.TEACHER,
    title: "Rekap Kehadiran",
    url: "/admin/absensi/guru",
    icon: ClipboardList,
  },
  {
    section: "Umum",
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

// User Management (Super Admin only)
export const userManagementItems: SidebarNavItem[] = [
  {
    title: "Kelola User",
    url: "/admin/users",
    icon: UserCog,
  },
];
