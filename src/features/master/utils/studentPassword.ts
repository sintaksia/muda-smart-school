const PASSWORD_PREFIX = "Siswa";

/**
 * Deterministic default login password for students created without an
 * explicit one (manual add with the field left blank, and every import row).
 * Always satisfies the account policy: >= 8 chars, upper + lower + digit.
 *
 * The admin can reconstruct it from the NIS alone, and it is echoed back in
 * the import result so it can be handed out. Students change it after first
 * login.
 */
export function defaultStudentPassword(nis: string): string {
  const digits = nis.replace(/\D/g, "");
  return `${PASSWORD_PREFIX}${digits.padStart(4, "0")}`;
}
