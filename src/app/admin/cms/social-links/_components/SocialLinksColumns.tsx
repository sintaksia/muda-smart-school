"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/src/app/admin/_components/SortableHeader";
import { StatusBadge } from "@/src/app/admin/_components/StatusBadge";
import { SocialLinkActions } from "./SocialLinksActions";
import { indexColumn } from "@/src/app/admin/_components/indexColumn";
import { socialPlatforms } from "./SocialLinksSchema";
import type { SocialLink } from "@/src/features/cms/services/social-links";

const getPlatformIcon = (platform: string | null) => {
  const item = socialPlatforms.find((p) => p.value === platform);
  if (!item) return null;
  const Icon = item.icon;
  return <Icon className="h-3 w-3" />;
};

const getPlatformLabel = (platform: string | null) => {
  if (!platform) return null;
  return socialPlatforms.find((p) => p.value === platform)?.label || platform;
};

const getPlatformColor = (platform: string | null) => {
  switch (platform) {
    case "INSTAGRAM":
      return "text-white bg-pink-500";
    case "FACEBOOK":
      return "text-white bg-blue-600";
    case "YOUTUBE":
      return "text-white bg-red-600";
    case "TWITTER":
      return "text-white bg-sky-500";
    case "TIKTOK":
      return "text-white bg-gray-900";
    case "LINKEDIN":
      return "text-white bg-blue-800";
    case "WEBSITE":
      return "text-white bg-primary-600";
    default:
      return "";
  }
};

export const socialLinksColumns: ColumnDef<SocialLink>[] = [
  indexColumn<SocialLink>(),
  {
    accessorKey: "platform",
    header: ({ column }) => <SortableHeader column={column} label="Platform" />,
    cell: ({ row }) => {
      const platform = row.original.platform;
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getPlatformColor(
            platform,
          )}`}
        >
          {getPlatformIcon(platform)}
          {getPlatformLabel(platform)}
        </span>
      );
    },
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) =>
      row.original.username || <span className="text-muted-foreground">-</span>,
  },
  {
    accessorKey: "url",
    header: "URL",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => <StatusBadge isActive={row.original.isActive} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <SocialLinkActions socialLink={row.original} />,
  },
];
