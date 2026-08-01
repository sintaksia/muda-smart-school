"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/src/components/ui/sidebar";

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
}

interface SidebarCollapsibleGroupProps {
  label: string;
  icon: LucideIcon;
  items: SidebarNavItem[];
}

function isItemActive(pathname: string, url: string): boolean {
  return (
    pathname === url ||
    (url !== "/admin/absensi" && pathname.startsWith(url + "/"))
  );
}

export function SidebarCollapsibleGroup({
  label,
  icon: Icon,
  items,
}: SidebarCollapsibleGroupProps) {
  const pathname = usePathname();
  const hasActiveChild = items.some((item) => isItemActive(pathname, item.url));

  return (
    <SidebarGroup className={SIDEBAR_GROUP_CLASS}>
      <SidebarGroupContent>
        <SidebarMenu>
          <Collapsible
            defaultOpen={hasActiveChild}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={label} isActive={hasActiveChild}>
                  <Icon />
                  <span>{label}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="mt-1 mb-1 py-0">
                  {items.map((item) => (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isItemActive(pathname, item.url)}
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
