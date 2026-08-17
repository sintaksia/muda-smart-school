import { ENTITY_LABELS } from "@/src/lib/constants";

/**
 * Single source of truth for the admin dashboard action center.
 *
 * The service returns counts only; every label, destination and badge variant
 * lives here so a wording or routing change updates the card, and any future
 * consumer, at once.
 */
export const adminActionItemOptions = [
  {
    key: "REGISTRATION_PENDING",
    label: "Pendaftaran menunggu verifikasi",
    description: "Calon siswa baru yang belum divalidasi",
    href: "/admin/registrations?status=PENDING",
    badge: "warning" as const,
  },
  {
    key: "LEAVE_PENDING",
    label: "Izin/sakit belum ditinjau",
    description: "Pengajuan yang menunggu persetujuan",
    href: "/admin/absensi/izin",
    badge: "info" as const,
  },
  {
    key: "CREDIT_CRITICAL",
    label: `${ENTITY_LABELS.STUDENT} di ambang kritis`,
    description: "Skor kredit mencapai batas kritis",
    href: "/admin/absensi/kredit",
    badge: "destructive" as const,
  },
] as const;

export type AdminActionItemKey = (typeof adminActionItemOptions)[number]["key"];

export const ADMIN_ACTION_ITEM_KEYS = adminActionItemOptions.map((o) => o.key);

/** Every counter at zero — the shape returned when there is nothing to do. */
export const EMPTY_ADMIN_ACTION_COUNTS: Record<AdminActionItemKey, number> =
  Object.fromEntries(adminActionItemOptions.map((o) => [o.key, 0])) as Record<
    AdminActionItemKey,
    number
  >;
