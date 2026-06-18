import type { User, UserRole, UserStatus } from "@prisma/client";

// Re-export Prisma types
export type { User, UserRole, UserStatus };

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  avatar?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
}

// Single source of truth for UserRole values, labels, hierarchy, and badge colors
export const userRoleOptions = [
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    level: 4,
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    value: "ADMIN",
    label: "Admin",
    level: 3,
    badgeColor: "bg-primary-100 text-primary-700",
  },
  {
    value: "TEACHER",
    label: "Guru",
    level: 2,
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    value: "STUDENT",
    label: "Siswa",
    level: 1,
    badgeColor: "bg-yellow-100 text-yellow-700",
  },
] as const satisfies readonly {
  value: UserRole;
  label: string;
  level: number;
  badgeColor: string;
}[];

export const USER_ROLE_VALUES = userRoleOptions.map((o) => o.value) as [
  UserRole,
  ...UserRole[],
];

// Role hierarchy for permission checks
export const ROLE_HIERARCHY: Record<UserRole, number> = Object.fromEntries(
  userRoleOptions.map((o) => [o.value, o.level]),
) as Record<UserRole, number>;

// Human-readable role labels
export const ROLE_LABELS: Record<UserRole, string> = Object.fromEntries(
  userRoleOptions.map((o) => [o.value, o.label]),
) as Record<UserRole, string>;

export const ROLE_BADGE_COLORS: Record<UserRole, string> = Object.fromEntries(
  userRoleOptions.map((o) => [o.value, o.badgeColor]),
) as Record<UserRole, string>;

// Single source of truth for UserStatus values, labels, and badge colors
export const userStatusOptions = [
  {
    value: "ACTIVE",
    label: "Aktif",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    value: "INACTIVE",
    label: "Tidak Aktif",
    badgeColor: "bg-gray-100 text-gray-700",
  },
  {
    value: "SUSPENDED",
    label: "Dibekukan",
    badgeColor: "bg-red-100 text-red-700",
  },
] as const satisfies readonly {
  value: UserStatus;
  label: string;
  badgeColor: string;
}[];

export const USER_STATUS_VALUES = userStatusOptions.map((o) => o.value) as [
  UserStatus,
  ...UserStatus[],
];

// Status labels
export const STATUS_LABELS: Record<UserStatus, string> = Object.fromEntries(
  userStatusOptions.map((o) => [o.value, o.label]),
) as Record<UserStatus, string>;

export const STATUS_BADGE_COLORS: Record<UserStatus, string> =
  Object.fromEntries(
    userStatusOptions.map((o) => [o.value, o.badgeColor]),
  ) as Record<UserStatus, string>;
