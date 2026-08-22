import type { LucideIcon } from "lucide-react";

/**
 * Shared spacing for every top-level sidebar group. Neutralises the default
 * `p-2` on SidebarGroup so group triggers sit on the same 4px rhythm as the
 * items inside an expanded group (SidebarMenu / SidebarMenuSub use `gap-1`).
 */
export const SIDEBAR_GROUP_CLASS = "px-2 py-0";

export interface SidebarNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Renders a heading above this item, opening a labelled run of items inside
   *  the group (e.g. "Siswa" vs "Guru" under Absensi). */
  section?: string;
}

export function isItemActive(pathname: string, url: string): boolean {
  return (
    pathname === url ||
    (url !== "/admin/absensi" && pathname.startsWith(url + "/"))
  );
}
