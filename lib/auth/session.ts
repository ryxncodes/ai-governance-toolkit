import { cookies } from "next/headers"
import type { Membership, Organization, User } from "@prisma/client"

import { can, type Permission } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import {
  DEMO_ORG_ID,
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
} from "@/lib/organizations"

const USER_COOKIE = "clearuse_user_id"
const ORG_COOKIE = "clearuse_org_id"

export type AppSession = Membership & {
  user: User
  organization: Organization
}

export async function setSessionCookies(userId: string, organizationId: string) {
  const cookieStore = await cookies()
  cookieStore.set(USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
  cookieStore.set(ORG_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
}

export async function clearSessionCookies() {
  const cookieStore = await cookies()
  cookieStore.delete(USER_COOKIE)
  cookieStore.delete(ORG_COOKIE)
}

async function ensureDemoSession() {
  const organization = await prisma.organization.upsert({
    where: { id: DEMO_ORG_ID },
    update: {},
    create: { id: DEMO_ORG_ID, name: "Demo Organization" },
  })

  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: { email: DEMO_USER_EMAIL, name: "Demo IT Owner" },
    create: {
      id: DEMO_USER_ID,
      email: DEMO_USER_EMAIL,
      name: "Demo IT Owner",
    },
  })

  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
    update: { role: "OWNER" },
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: "OWNER",
    },
  })

  return { userId: user.id, organizationId: organization.id }
}

export async function getSession() {
  const cookieStore = await cookies()
  const fallback = await ensureDemoSession()
  const userId = cookieStore.get(USER_COOKIE)?.value ?? fallback.userId
  const organizationId = cookieStore.get(ORG_COOKIE)?.value ?? fallback.organizationId

  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    include: {
      user: true,
      organization: true,
    },
  })

  if (membership) {
    return membership
  }

  return prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: fallback.userId,
        organizationId: fallback.organizationId,
      },
    },
    include: {
      user: true,
      organization: true,
    },
  })
}

export async function getRequiredSession() {
  const session = await getSession()

  if (!session) {
    throw new Error("No active session")
  }

  return session
}

export async function hasSessionPermission(permission: Permission) {
  const session = await getSession()
  return session ? can(session.role, permission) : false
}
