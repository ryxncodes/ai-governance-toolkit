import { NextResponse } from "next/server"
import { notFound } from "next/navigation"

import { getRequiredSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { generateVendorReviewMarkdown } from "@/lib/reports/export"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getRequiredSession()
  const tool = await prisma.aiTool.findFirst({
    where: { id, organizationId: session.organizationId },
    include: { vendorReview: true },
  })

  if (!tool) {
    notFound()
  }

  return new NextResponse(generateVendorReviewMarkdown(tool), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${tool.name} Vendor Review.md"`,
    },
  })
}
