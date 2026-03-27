export const USER_ROLES = ["FARMER", "ADMIN", "SUPER_ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type AppPermission =
  | "farms.read.own"
  | "farms.read.any"
  | "farms.create"
  | "farms.delete.own"
  | "farms.delete.any"
  | "analyses.read.own"
  | "analyses.read.any"
  | "analyses.create"
  | "community.posts.delete.own"
  | "community.posts.delete.any"
  | "community.comments.edit.own"
  | "community.comments.delete.own"
  | "community.comments.delete.any"
  | "users.read.any"
  | "users.roles.manage";

const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<AppPermission>> = {
  FARMER: new Set<AppPermission>([
    "farms.read.own",
    "farms.create",
    "farms.delete.own",
    "analyses.read.own",
    "analyses.create",
    "community.posts.delete.own",
    "community.comments.edit.own",
    "community.comments.delete.own",
  ]),
  ADMIN: new Set<AppPermission>([
    "farms.read.own",
    "farms.read.any",
    "farms.create",
    "farms.delete.own",
    "farms.delete.any",
    "analyses.read.own",
    "analyses.read.any",
    "analyses.create",
    "community.posts.delete.own",
    "community.posts.delete.any",
    "community.comments.edit.own",
    "community.comments.delete.own",
    "community.comments.delete.any",
    "users.read.any",
  ]),
  SUPER_ADMIN: new Set<AppPermission>([
    "farms.read.own",
    "farms.read.any",
    "farms.create",
    "farms.delete.own",
    "farms.delete.any",
    "analyses.read.own",
    "analyses.read.any",
    "analyses.create",
    "community.posts.delete.own",
    "community.posts.delete.any",
    "community.comments.edit.own",
    "community.comments.delete.own",
    "community.comments.delete.any",
    "users.read.any",
    "users.roles.manage",
  ]),
};

export function normalizeRole(role?: string | null): UserRole {
  if (role === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (role === "ADMIN") return "ADMIN";
  return "FARMER";
}

export function hasPermission(role: string | null | undefined, permission: AppPermission) {
  const normalized = normalizeRole(role);
  return ROLE_PERMISSIONS[normalized].has(permission);
}

export function isAdminRole(role: string | null | undefined) {
  const normalized = normalizeRole(role);
  return normalized === "ADMIN" || normalized === "SUPER_ADMIN";
}

export function isSuperAdminRole(role: string | null | undefined) {
  return normalizeRole(role) === "SUPER_ADMIN";
}
