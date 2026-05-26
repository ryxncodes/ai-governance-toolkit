import { NextResponse } from "next/server"
import { notFound } from "next/navigation"

import { getRequiredSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { generatePolicyGapMarkdown } from "@/lib/reports/export"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getRequiredSession()
  const policy = await prisma.policy.findFirst({
    where: { id, organizationId: session.organizationId },
  })

  if (!policy) {
    notFound()
  }

  return new NextResponse(generatePolicyGapMarkdown(policy), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${policy.title} AI Policy Gap Report.md"`,
    },
  })
}
