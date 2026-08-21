import { STUDENT_EMAIL_DOMAIN } from "@/src/lib/constants";

const SEQUENCE_LENGTH = 3;

/**
 * Next NIS for an intake year: `<angkatan><3-digit sequence>` (2026001,
 * 2026002, …), continuing after the highest NIS already issued for that year.
 * NIS values that don't follow the pattern (legacy, hand-typed) are ignored
 * rather than parsed, so they can never push the counter somewhere silly.
 */
export function nextNis(angkatan: number, existingNis: string[]): string {
  const prefix = String(angkatan);
  const pattern = new RegExp(`^${prefix}(\\d{${SEQUENCE_LENGTH}})$`);

  const highest = existingNis.reduce((max, nis) => {
    const match = nis.match(pattern);
    if (!match) return max;
    return Math.max(max, Number.parseInt(match[1], 10));
  }, 0);

  return `${prefix}${String(highest + 1).padStart(SEQUENCE_LENGTH, "0")}`;
}

/**
 * Login address for a student whose registration carries no usable email, so a
 * bulk sync never stalls on a missing contact detail.
 */
export function fallbackStudentEmail(nis: string): string {
  return `${nis}@${STUDENT_EMAIL_DOMAIN}`;
}

interface PickStudentEmailOptions {
  /** `studentEmail` from the registration, if any. */
  registrationEmail: string | null;
  nis: string;
  /** How many registrations in this batch list the same address. */
  sharedCount: number;
  /** Addresses already used by an existing login. */
  takenEmails: Set<string>;
}

/**
 * Decide which address a student created from a registration logs in with.
 *
 * A registration's own email is used only when it can actually identify one
 * person: schools routinely put their own address on many registrations, and a
 * shared or already-registered address can't become a personal login. In those
 * cases the student gets a generated `<nis>@domain` address instead of the
 * intake failing.
 */
export function pickStudentEmail({
  registrationEmail,
  nis,
  sharedCount,
  takenEmails,
}: PickStudentEmailOptions): string {
  const candidate = registrationEmail?.trim().toLowerCase();
  const isPersonal =
    Boolean(candidate) && sharedCount === 1 && !takenEmails.has(candidate!);
  return isPersonal ? candidate! : fallbackStudentEmail(nis);
}
