import { GraduationCap, HeartHandshake, Presentation } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ENTITY_LABELS } from "@/src/lib/constants";

/**
 * The audiences the portal serves, listed on the login page so visitors can
 * see the portal is theirs before signing in.
 *
 * This is presentation only — there is one sign-in form for everyone, and the
 * portal a user lands in comes from their account's `UserRole` via
 * `getHomeRouteForRole`, never from anything chosen on this page.
 */
export interface LoginAudience {
  key: string;
  label: string;
  /** What this person gets after signing in. */
  tagline: string;
  icon: LucideIcon;
  /** Pastel icon tile, drawn from the brand ramps (design_system.md §2.1). */
  tileClass: string;
}

export const loginAudiences = [
  {
    key: "TEACHER",
    label: ENTITY_LABELS.TEACHER,
    tagline: "Jadwal mengajar, sesi kelas, dan absensi siswa.",
    icon: Presentation,
    tileClass: "bg-green-500/15 text-green-700",
  },
  {
    key: "STUDENT",
    label: ENTITY_LABELS.STUDENT,
    tagline: "Jadwal pelajaran, rekap kehadiran, dan kartu QR.",
    icon: GraduationCap,
    tileClass: "bg-yellow-400/30 text-yellow-800",
  },
  {
    key: "PARENT",
    label: ENTITY_LABELS.PARENT,
    tagline: "Pantau kehadiran dan perkembangan anak.",
    icon: HeartHandshake,
    tileClass: "bg-primary-500/15 text-primary-800",
  },
] as const satisfies readonly LoginAudience[];

/** Example address shown in the email field. */
export const LOGIN_EMAIL_PLACEHOLDER = "nama@muda.sch.id";
