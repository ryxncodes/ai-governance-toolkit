import Link from "next/link"
import type React from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react"

import {
  extractVendorDocumentationAction,
  upsertVendorReviewAction,
} from "@/app/tools/actions"
import { VendorExtractionForm } from "@/components/ai/vendor-extraction-form"
import { RiskBadge } from "@/components/reviews/risk-badge"
import { VendorReviewForm } from "@/components/reviews/vendor-review-form"
import { DataTypesBadges } from "@/components/tools/data-types-badges"
import { StatusBadge } from "@/components/tools/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TOOL_STATUS_LABELS } from "@/lib/constants"
import { getRequiredSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { formatDate } from "@/lib/format"
import {
  type VendorReviewFormState,
  vendorReviewToFormValues,
} from "@/lib/reviews/form"
import { recommendedStatusForScore } from "@/lib/scoring/risk"
import type { VendorExtractionResult } from "@/lib/ai/vendor-extraction"

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

function LatestExtraction({
  extraction,
}: {
  extraction:
    | {
        sourceName: string
        riskSummary: string
        employeeGuidance: string
        findingsJson: unknown
        createdAt: Date
      }
    | null
    | undefined
}) {
  if (!extraction) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        No vendor documentation has been extracted yet.
      </div>
    )
  }

  const findings = extraction.findingsJson as VendorExtractionResult
  const rows = [
    ["Model training", findings.modelTraining],
    ["Data retention", findings.dataRetention],
    ["SSO", findings.ssoSupport],
    ["Audit logs", findings.auditLogs],
    ["Admin controls", findings.adminControls],
    ["Compliance claims", findings.complianceClaims],
    ["Deletion support", findings.deletionSupport],
    ["Terms clarity", findings.termsClarity],
    ["Sensitive data handling", findings.sensitiveDataHandling],
  ] as const

  return (
    <div className="grid gap-4 rounded-lg border border-border p-4">
      <div>
        <p className="text-sm font-medium">{extraction.sourceName}</p>
        <p className="text-xs text-muted-foreground">
          Extracted {extraction.createdAt.toLocaleDateString("en-US")}
        </p>
      </div>
      <div className="grid gap-2">
        {rows.map(([label, finding]) => (
          <div key={label} className="grid gap-1 rounded-lg bg-muted/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                {finding.status} · {finding.confidence} confidence
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{finding.evidence}</p>
          </div>
        ))}
      </div>
      <TextSection title="Extraction risk summary" body={extraction.riskSummary} />
      <TextSection
        title="Suggested employee guidance"
        body={extraction.employeeGuidance}
      />
    </div>
  )
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getRequiredSession()
  const tool = await prisma.aiTool.findFirst({
    where: { id, organizationId: session.organizationId },
    include: {
      vendorReview: true,
      documentExtractions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })

  if (!tool) {
    notFound()
  }

  const review = tool.vendorReview
  const latestExtraction = tool.documentExtractions[0]
  const reviewInitialState: VendorReviewFormState = {
    values: vendorReviewToFormValues(review),
    errors: {},
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
            <DetailItem
              label="Risk level"
              value={
                review ? (
                  <div className="flex items-center gap-2">
                    <RiskBadge level={review.riskLevel} />
                    <span className="text-muted-foreground">
                      Score {review.riskScore}/100
                    </span>
                  </div>
                ) : (
                  "Not reviewed"
                )
              }
            />
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
          <CardTitle>AI-assisted vendor extraction</CardTitle>
          <CardDescription>
            Paste vendor privacy, security, terms, or FAQ text to extract
            structured review fields with evidence snippets. Reviewers can edit
            the saved risk review after extraction.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <LatestExtraction extraction={latestExtraction} />
          <VendorExtractionForm
            action={extractVendorDocumentationAction.bind(null, tool.id)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendor risk review</CardTitle>
          <CardDescription>
            Operational risk scoring for privacy, security, admin controls, and
            acceptable-use conditions. This is a review aid, not legal advice.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {review ? (
            <div className="grid gap-4 rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center gap-3">
                <RiskBadge level={review.riskLevel} />
                <p className="text-sm text-muted-foreground">
                  Score {review.riskScore}/100 · Recommended status:{" "}
                  {
                    TOOL_STATUS_LABELS[
                      recommendedStatusForScore(review.riskScore)
                    ]
                  }
                </p>
              </div>
              {review.topRiskFactors.length > 0 ? (
                <div className="grid gap-2">
                  <h3 className="text-sm font-medium">Top risk factors</h3>
                  <ul className="grid gap-1 text-sm text-muted-foreground">
                    {review.topRiskFactors.map((factor) => (
                      <li key={factor}>- {factor}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {review.missingInformation.length > 0 ? (
                <div className="grid gap-2">
                  <h3 className="text-sm font-medium">Missing information</h3>
                  <ul className="grid gap-1 text-sm text-muted-foreground">
                    {review.missingInformation.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {review.recommendation ? (
                <TextSection
                  title="Reviewer recommendation"
                  body={review.recommendation}
                />
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              No vendor review has been saved yet. Complete the form below to
              calculate the first risk score.
            </div>
          )}
          <VendorReviewForm
            action={upsertVendorReviewAction.bind(null, tool.id)}
            initialState={reviewInitialState}
          />
        </CardContent>
      </Card>
    </div>
  )
}
