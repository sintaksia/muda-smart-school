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
  useSidebar,
} from "@/src/components/ui/sidebar";
import { SidebarGroupDropdown } from "./SidebarGroupDropdown";
import {
  isItemActive,
  SIDEBAR_GROUP_CLASS,
  type SidebarNavItem,
} from "./sidebarGroup";

interface SidebarCollapsibleGroupProps {
  label: string;
  icon: LucideIcon;
  items: SidebarNavItem[];
}

export function SidebarCollapsibleGroup({
  label,
  icon: Icon,
  items,
}: SidebarCollapsibleGroupProps) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const hasActiveChild = items.some((item) => isItemActive(pathname, item.url));
  const isIconRail = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup className={SIDEBAR_GROUP_CLASS}>
      <SidebarGroupContent>
        <SidebarMenu>
          {isIconRail ? (
            <SidebarGroupDropdown
              label={label}
              icon={Icon}
              items={items}
              hasActiveChild={hasActiveChild}
            />
          ) : (
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
                      <SidebarMenuSubItem key={item.url}>
                        {item.section && (
                          <p className="text-sidebar-foreground/60 px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide">
                            {item.section}
                          </p>
                        )}
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
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
