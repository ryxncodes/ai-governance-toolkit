import { ToolStatus } from "@prisma/client"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StatusBadge } from "@/components/tools/status-badge"
import { prisma } from "@/lib/db/prisma"
import { TOOL_STATUS_LABELS } from "@/lib/constants"
import { getRequiredSession } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

const statusOrder: ToolStatus[] = [
  "APPROVED",
  "RESTRICTED",
  "UNDER_REVIEW",
  "BLOCKED",
]

export default async function DashboardPage() {
  const session = await getRequiredSession()
  const organizationId = session.organizationId

  const [tools, statusCounts] = await Promise.all([
    prisma.aiTool.count({ where: { organizationId } }),
    prisma.aiTool.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: { status: true },
    }),
  ])

  const countByStatus = Object.fromEntries(
    statusCounts.map((row) => [row.status, row._count.status])
  ) as Record<ToolStatus, number>

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your organization&apos;s AI tool governance registry.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total tools</CardDescription>
            <CardTitle className="text-3xl">{tools}</CardTitle>
          </CardHeader>
        </Card>
        {statusOrder.map((status) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardDescription>{TOOL_STATUS_LABELS[status]}</CardDescription>
              <CardTitle className="flex items-center gap-2 text-3xl">
                {countByStatus[status] ?? 0}
                <StatusBadge status={status} />
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            Phase 1 delivers a usable AI tool registry with demo data, create
            and edit workflows, and room for risk scoring in the next phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/tools">
            <Button>View AI tools registry</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
