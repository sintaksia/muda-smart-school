"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar";
import { isItemActive, type SidebarNavItem } from "./sidebarGroup";

interface SidebarGroupDropdownProps {
  label: string;
  icon: LucideIcon;
  items: SidebarNavItem[];
  hasActiveChild: boolean;
}

/**
 * Collapsed (icon-rail) rendering of a sidebar group. `SidebarMenuSub` is
 * hidden at this width, so an inline Collapsible would toggle nothing — the
 * children open in a flyout menu next to the rail instead.
 */
export function SidebarGroupDropdown({
  label,
  icon: Icon,
  items,
  hasActiveChild,
}: SidebarGroupDropdownProps) {
  const pathname = usePathname();

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={label} isActive={hasActiveChild}>
            <Icon />
            <span>{label}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="min-w-56">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {items.map((item) => (
            <Fragment key={item.url}>
              {item.section && (
                <DropdownMenuLabel className="text-muted-foreground pt-2 text-[11px] font-semibold uppercase tracking-wide">
                  {item.section}
                </DropdownMenuLabel>
              )}
              <DropdownMenuItem asChild>
                <Link
                  href={item.url}
                  data-active={isItemActive(pathname, item.url)}
                  className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground"
                >
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
