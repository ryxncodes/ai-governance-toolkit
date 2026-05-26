import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { DataTypesBadges } from "@/components/tools/data-types-badges"
import { StatusBadge } from "@/components/tools/status-badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getRequiredSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { employeeStatusSummary } from "@/lib/tools/employee-guidance"

export const dynamic = "force-dynamic"

function GuidanceText({
  title,
  body,
}: {
  title: string
  body?: string | null
}) {
  return (
    <div className="grid gap-1">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
        {body || "Not specified"}
      </p>
    </div>
  )
}

export default async function ApprovedToolsPage() {
  const session = await getRequiredSession()

  const tools = await prisma.aiTool.findMany({
    where: {
      organizationId: session.organizationId,
      status: { in: ["APPROVED", "RESTRICTED"] },
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Employee AI Tool Guide
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Approved and restricted AI tools employees may use, with practical
          limits for data and use cases.
        </p>
      </div>

      {tools.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No approved or restricted AI tools are ready for employee guidance.
        </p>
      ) : (
        <div className="grid gap-4">
          {tools.map((tool) => (
            <Card key={tool.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{tool.name}</CardTitle>
                    <CardDescription>
                      {tool.vendor} · {tool.category}
                    </CardDescription>
                  </div>
                  <StatusBadge status={tool.status} />
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="text-sm font-medium">
                  {employeeStatusSummary(tool.status)}
                </p>
                <div className="grid gap-4 lg:grid-cols-2">
                  <GuidanceText
                    title="Approved use"
                    body={tool.approvedUseCases}
                  />
                  <GuidanceText
                    title="Do not use for"
                    body={tool.blockedUseCases}
                  />
                </div>
                <div className="grid gap-2">
                  <h3 className="text-sm font-medium">Allowed data</h3>
                  <DataTypesBadges
                    dataTypes={tool.allowedDataTypes}
                    maxVisible={tool.allowedDataTypes.length}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    className="text-sm text-primary underline-offset-4 hover:underline"
                    href={`/tools/${tool.id}`}
                  >
                    View registry details
                  </Link>
                  {tool.website ? (
                    <a
                      className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                      href={tool.website}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Vendor website
                      <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
