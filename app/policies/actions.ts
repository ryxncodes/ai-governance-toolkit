"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/db/prisma"
import { can } from "@/lib/auth/permissions"
import { getSession } from "@/lib/auth/session"
import { auditPolicy } from "@/lib/policies/audit"

export type PolicyFormState = {
  title: string
  content: string
  error?: string
}

export async function auditPolicyAction(
  _previousState: PolicyFormState,
  formData: FormData
): Promise<PolicyFormState> {
  const title = String(formData.get("title") ?? "").trim()
  const content = String(formData.get("content") ?? "").trim()
  const session = await getSession()

  if (!session || !can(session.role, "review:update")) {
    return {
      title,
      content,
      error: "You do not have permission to audit policies.",
    }
  }

  if (!title) {
    return { title, content, error: "Policy title is required." }
  }

  if (content.length < 120) {
    return {
      title,
      content,
      error: "Paste at least a few paragraphs of policy text to audit.",
    }
  }

  const audit = auditPolicy(content)
  const policy = await prisma.policy.create({
    data: {
      organizationId: session.organizationId,
      title,
      content,
      score: audit.score,
      auditJson: audit,
    },
    select: { id: true },
  })

  revalidatePath("/policies")
  redirect(`/policies?policy=${policy.id}`)
}
