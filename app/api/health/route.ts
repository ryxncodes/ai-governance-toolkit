import { NextResponse } from "next/server"

import { getRequiredSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  const session = await getRequiredSession()
  const organizationId = session.organizationId

  const [tools, memberships, policies] = await Promise.all([
    prisma.aiTool.count({ where: { organizationId } }),
    prisma.membership.count({ where: { organizationId } }),
    prisma.policy.count({ where: { organizationId } }),
  ])

  return NextResponse.json({
    ok: true,
    database: "connected",
    organizationId,
    counts: {
      tools,
      memberships,
      policies,
    },
  })
}
