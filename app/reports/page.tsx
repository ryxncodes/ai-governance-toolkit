import Link from "next/link"
import { Download } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getRequiredSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const session = await getRequiredSession()

  const [tools, policies] = await Promise.all([
    prisma.aiTool.findMany({
      where: { organizationId: session.organizationId },
      include: { vendorReview: true },
      orderBy: { name: "asc" },
    }),
    prisma.policy.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Export markdown and CSV artifacts for vendor reviews, employee
          guidance, policy gaps, and the AI risk register.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Standard exports</CardTitle>
            <CardDescription>
              Organization-level reports generated from the current registry.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <a
              className={buttonVariants({ variant: "outline" })}
              href="/reports/approved-tools"
            >
              <Download className="size-4" />
              Employee guide.md
            </a>
            <a
              className={buttonVariants({ variant: "outline" })}
              href="/reports/risk-register"
            >
              <Download className="size-4" />
              Risk register.csv
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policy gap reports</CardTitle>
            <CardDescription>
              Markdown exports for saved policy audits.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {policies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No policy audits available yet.
              </p>
            ) : (
              policies.map((policy) => (
                <a
                  key={policy.id}
                  className={buttonVariants({
                    variant: "outline",
                    className: "justify-start",
                  })}
                  href={`/reports/policy-gap/${policy.id}`}
                >
                  <Download className="size-4" />
                  {policy.title}
                </a>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor review reports</CardTitle>
          <CardDescription>
            Export one markdown review per AI tool.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              className={buttonVariants({
                variant: "outline",
                className: "justify-start",
              })}
              href={`/reports/vendor-review/${tool.id}`}
            >
              <Download className="size-4" />
              {tool.name} Vendor Review.md
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
