"use server"

import { redirect } from "next/navigation"

import { setSessionCookies, clearSessionCookies } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { DEMO_ORG_ID } from "@/lib/organizations"

export type LoginState = {
  email: string
  name: string
  error?: string
}

export async function loginAction(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const name = String(formData.get("name") ?? "").trim()

  if (!email || !email.includes("@")) {
    return { email, name, error: "Enter a valid email address." }
  }

  const organization = await prisma.organization.upsert({
    where: { id: DEMO_ORG_ID },
    update: {},
    create: { id: DEMO_ORG_ID, name: "Demo Organization" },
  })

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: name || undefined },
    create: { email, name: name || null },
  })

  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: "OWNER",
    },
  })

  await setSessionCookies(user.id, organization.id)
  redirect("/")
}

export async function logoutAction() {
  await clearSessionCookies()
  redirect("/login")
}
