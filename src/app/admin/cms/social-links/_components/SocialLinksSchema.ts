import { z } from "zod";
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Link as LinkIcon,
} from "lucide-react";

export const socialPlatforms = [
  { value: "INSTAGRAM", label: "Instagram", icon: Instagram },
  { value: "FACEBOOK", label: "Facebook", icon: Facebook },
  { value: "YOUTUBE", label: "YouTube", icon: Youtube },
  { value: "TWITTER", label: "Twitter", icon: Twitter },
  { value: "TIKTOK", label: "TikTok", icon: LinkIcon },
  { value: "LINKEDIN", label: "LinkedIn", icon: LinkIcon },
  { value: "WEBSITE", label: "Website", icon: LinkIcon },
] as const;

export const socialLinkSchema = z.object({
  platform: z.enum([
    "INSTAGRAM",
    "FACEBOOK",
    "YOUTUBE",
    "TWITTER",
    "TIKTOK",
    "LINKEDIN",
    "WEBSITE",
  ]),
  url: z.string().min(1, "URL wajib diisi").url("URL tidak valid"),
  username: z.string().optional(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export type SocialLinkFormData = z.infer<typeof socialLinkSchema>;
