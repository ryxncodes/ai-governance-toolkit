import { NextResponse } from "next/server"

import { getRequiredSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { generateRiskRegisterCsv } from "@/lib/reports/export"

export async function GET() {
  const session = await getRequiredSession()

  const tools = await prisma.aiTool.findMany({
    where: { organizationId: session.organizationId },
    include: { vendorReview: true },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  })

  return new NextResponse(generateRiskRegisterCsv(tools), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="AI Risk Register.csv"',
    },
  })
}
