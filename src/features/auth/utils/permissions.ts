import type { UserRole } from "@prisma/client";
import { ROLE_HIERARCHY, USER_ROLE_VALUES } from "../types";

/**
 * Check if a role has at least the required permission level
 */
export function hasMinimumRole(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can access admin panel
 * Only SUPER_ADMIN and ADMIN can access
 */
export function canAccessAdmin(role: UserRole): boolean {
  return hasMinimumRole(role, "ADMIN");
}

/**
 * Check if user can manage other users
 * Only SUPER_ADMIN can manage users
 */
export function canManageUsers(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

/**
 * Check if user can manage CMS content
 * SUPER_ADMIN and ADMIN can manage all CMS content
 */
export function canManageCMS(role: UserRole): boolean {
  return hasMinimumRole(role, "ADMIN");
}

/**
 * Check if user can manage school settings
 * Only SUPER_ADMIN can manage settings
 */
export function canManageSettings(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

/**
 * Get allowed roles for user creation based on creator's role
 */
export function getAllowedRolesToCreate(creatorRole: UserRole): UserRole[] {
  switch (creatorRole) {
    case "SUPER_ADMIN":
      return [...USER_ROLE_VALUES];
    case "ADMIN":
      return ["TEACHER", "STUDENT"];
    default:
      return [];
  }
}

/**
 * Check if user can modify another user based on roles
 */
export function canModifyUser(
  actorRole: UserRole,
  targetRole: UserRole,
): boolean {
  // Super admin can modify anyone
  if (actorRole === "SUPER_ADMIN") {
    return true;
  }
  // Admin can only modify teachers and students
  if (actorRole === "ADMIN") {
    return targetRole === "TEACHER" || targetRole === "STUDENT";
  }
  return false;
}

/**
 * Routes that require specific roles
 */
export const PROTECTED_ROUTES: Record<string, UserRole> = {
  "/admin/users": "SUPER_ADMIN",
  "/admin/pengaturan": "SUPER_ADMIN",
  "/admin": "ADMIN",
};

/**
 * Check if user has access to a specific route
 */
export function canAccessRoute(role: UserRole, pathname: string): boolean {
  // Find the most specific matching route
  const matchingRoutes = Object.entries(PROTECTED_ROUTES)
    .filter(([route]) => pathname.startsWith(route))
    .sort((a, b) => b[0].length - a[0].length);

  if (matchingRoutes.length === 0) {
    return true; // No protection defined
  }

  const [, requiredRole] = matchingRoutes[0];
  return hasMinimumRole(role, requiredRole);
}
