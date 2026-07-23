import type { UserRole } from "@prisma/client";

/**
 * Maps a user's role to their post-login landing route.
 */
export function getHomeRouteForRole(role: UserRole): string {
  switch (role) {
    case "STUDENT":
      return "/siswa";
    case "TEACHER":
      return "/guru";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin";
    default:
      return "/login";
  }
}
