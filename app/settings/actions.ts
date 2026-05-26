"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { getSession, setSessionCookies } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

export type WorkspaceState = {
  name: string
  error?: string
}

export async function createWorkspaceAction(
  _previousState: WorkspaceState,
  formData: FormData
): Promise<WorkspaceState> {
  const name = String(formData.get("name") ?? "").trim()
  const session = await getSession()

  if (!session) {
    return { name, error: "Log in before creating a workspace." }
  }

  if (!name) {
    return { name, error: "Workspace name is required." }
  }

  const organization = await prisma.organization.create({
    data: {
      name,
      memberships: {
        create: {
          userId: session.userId,
          role: "OWNER",
        },
      },
    },
    select: { id: true },
  })

  await setSessionCookies(session.userId, organization.id)
  revalidatePath("/")
  redirect("/settings")
}
