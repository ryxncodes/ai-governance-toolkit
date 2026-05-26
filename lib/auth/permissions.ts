import type { MembershipRole } from "@prisma/client"

export type Permission =
  | "tool:create"
  | "tool:update"
  | "review:update"
  | "workspace:manage"
  | "approved:view"

const rolePermissions: Record<MembershipRole, Permission[]> = {
  OWNER: [
    "tool:create",
    "tool:update",
    "review:update",
    "workspace:manage",
    "approved:view",
  ],
  ADMIN: ["tool:create", "tool:update", "review:update", "approved:view"],
  REVIEWER: ["review:update", "approved:view"],
  VIEWER: ["approved:view"],
}

export function permissionsForRole(role: MembershipRole) {
  return rolePermissions[role]
}

export function can(role: MembershipRole, permission: Permission) {
  return permissionsForRole(role).includes(permission)
}

export function roleLabel(role: MembershipRole) {
  if (role === "OWNER") return "Owner"
  if (role === "ADMIN") return "Admin"
  if (role === "REVIEWER") return "Reviewer"
  return "Viewer"
}

export function roleDescription(role: MembershipRole) {
  if (role === "OWNER") {
    return "Can manage workspace settings, tools, and vendor reviews."
  }

  if (role === "ADMIN") {
    return "Can add tools, edit registry entries, and complete reviews."
  }

  if (role === "REVIEWER") {
    return "Can complete vendor reviews and view approved employee guidance."
  }

  return "Can view employee-facing approved and restricted tool guidance."
}
