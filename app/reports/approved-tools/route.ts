import { NextResponse } from "next/server"

import { getRequiredSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { generateApprovedToolsMarkdown } from "@/lib/reports/export"

export async function GET() {
  const session = await getRequiredSession()

  const tools = await prisma.aiTool.findMany({
    where: {
      organizationId: session.organizationId,
      status: { in: ["APPROVED", "RESTRICTED"] },
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  })

  return new NextResponse(generateApprovedToolsMarkdown(tools), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition":
        'attachment; filename="Approved AI Tools - Employee Guide.md"',
    },
  })
}
