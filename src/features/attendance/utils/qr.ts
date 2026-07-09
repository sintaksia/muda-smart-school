import { randomBytes } from "crypto";

/** Opaque, URL-safe session QR token. */
export function generateQrToken(): string {
  return randomBytes(24).toString("base64url");
}

/**
 * In DYNAMIC mode a token expires QR_TOKEN_TTL_SECONDS after issuance;
 * in STATIC mode the single token lives for the whole session.
 */
export function isQrTokenExpired(
  mode: "STATIC" | "DYNAMIC",
  issuedAt: Date | null,
  ttlSeconds: number,
  now: Date,
): boolean {
  if (mode === "STATIC") {
    return false;
  }
  if (!issuedAt) {
    return true;
  }
  return now.getTime() - issuedAt.getTime() > ttlSeconds * 1000;
}
