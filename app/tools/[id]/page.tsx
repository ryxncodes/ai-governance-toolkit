import Link from "next/link"
import type React from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react"

import { DataTypesBadges } from "@/components/tools/data-types-badges"
import { StatusBadge } from "@/components/tools/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { prisma } from "@/lib/db/prisma"
import { formatDate } from "@/lib/format"
import { DEMO_ORG_ID } from "@/lib/organizations"

export const dynamic = "force-dynamic"

function DetailItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{value || <span>Not set</span>}</dd>
    </div>
  )
}

function TextSection({ title, body }: { title: string; body?: string | null }) {
  return (
    <section className="grid gap-2">
      <h2 className="text-base font-medium">{title}</h2>
      <div className="min-h-20 rounded-lg border border-border bg-muted/30 p-4 text-sm leading-6 whitespace-pre-wrap">
        {body || <span className="text-muted-foreground">Not set</span>}
      </div>
    </section>
  )
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tool = await prisma.aiTool.findFirst({
    where: { id, organizationId: DEMO_ORG_ID },
  })

  if (!tool) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-3">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            AI Tools
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {tool.name}
              </h1>
              <StatusBadge status={tool.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {tool.vendor} · {tool.category}
            </p>
          </div>
        </div>
        <Link
          href={`/tools/${tool.id}/edit`}
          className={buttonVariants({ variant: "default" })}
        >
          <Pencil className="size-4" />
          Edit tool
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            Registry details and review ownership for this AI tool.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Vendor" value={tool.vendor} />
            <DetailItem label="Category" value={tool.category} />
            <DetailItem
              label="Website"
              value={
                tool.website ? (
                  <a
                    className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                    href={tool.website}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {tool.website}
                    <ExternalLink className="size-3" />
                  </a>
                ) : null
              }
            />
            <DetailItem label="Review owner" value={tool.reviewOwner} />
            <DetailItem
              label="Last reviewed"
              value={formatDate(tool.reviewDate)}
            />
            <DetailItem
              label="Next review"
              value={formatDate(tool.nextReviewDate)}
            />
            <DetailItem
              label="Allowed data"
              value={
                <DataTypesBadges
                  dataTypes={tool.allowedDataTypes}
                  maxVisible={tool.allowedDataTypes.length}
                />
              }
            />
            <DetailItem label="Risk level" value="Not reviewed" />
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <TextSection title="Description" body={tool.description} />
        <TextSection title="Approved use cases" body={tool.approvedUseCases} />
        <TextSection title="Blocked use cases" body={tool.blockedUseCases} />
        <TextSection title="Notes" body={tool.notes} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor risk review</CardTitle>
          <CardDescription>
            Risk scoring and structured vendor review fields will be added in
            the next phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border p-4">
            <p className="text-sm text-muted-foreground">
              Current risk level: Not reviewed
            </p>
            <Button variant="outline" disabled>
              Review coming next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
