import { CheckCircle2, XCircle } from "lucide-react"

import { PolicyAuditForm } from "@/components/policies/policy-audit-form"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getRequiredSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import type { PolicyAuditResult } from "@/lib/policies/audit"

export const dynamic = "force-dynamic"

function scoreLabel(score: number) {
  if (score >= 80) return "Strong"
  if (score >= 60) return "Moderate"
  if (score >= 40) return "Needs work"
  return "Incomplete"
}

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ policy?: string }>
}) {
  const { policy: policyId } = await searchParams
  const session = await getRequiredSession()
  const [policies, selectedPolicy] = await Promise.all([
    prisma.policy.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    policyId
      ? prisma.policy.findFirst({
          where: { id: policyId, organizationId: session.organizationId },
        })
      : prisma.policy.findFirst({
          where: { organizationId: session.organizationId },
          orderBy: { createdAt: "desc" },
        }),
  ])

  const audit = selectedPolicy?.auditJson as PolicyAuditResult | undefined

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Policy Auditor
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Paste an AI policy to check coverage, risky language, suggested
          additions, and an employee-facing summary. This is operational
          guidance, not legal advice.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Audit policy text</CardTitle>
            <CardDescription>
              Save each audit so it can be compared or exported later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PolicyAuditForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent audits</CardTitle>
            <CardDescription>Latest saved policy checks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {policies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No policy audits saved yet.
              </p>
            ) : (
              policies.map((policy) => (
                <a
                  key={policy.id}
                  className="grid gap-1 rounded-lg border border-border p-3 text-sm hover:bg-muted/50"
                  href={`/policies?policy=${policy.id}`}
                >
                  <span className="font-medium">{policy.title}</span>
                  <span className="text-muted-foreground">
                    Score {policy.score}/100 · {scoreLabel(policy.score)}
                  </span>
                </a>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {selectedPolicy && audit ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{selectedPolicy.title}</CardTitle>
                <CardDescription>
                  Policy completeness score and suggested improvements.
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {selectedPolicy.score}/100 · {scoreLabel(selectedPolicy.score)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2 md:grid-cols-2">
              {audit.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-2 rounded-lg border border-border p-3"
                >
                  {item.matched ? (
                    <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    {!item.matched ? (
                      <p className="text-sm text-muted-foreground">
                        {item.suggestion}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {audit.riskyLanguage.length > 0 ? (
              <section className="grid gap-2">
                <h2 className="font-medium">Risky language</h2>
                <ul className="grid gap-1 text-sm text-muted-foreground">
                  {audit.riskyLanguage.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="grid gap-2">
              <h2 className="font-medium">Suggested additions</h2>
              <ul className="grid gap-1 text-sm text-muted-foreground">
                {audit.suggestedAdditions.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </section>

            <section className="grid gap-2">
              <h2 className="font-medium">Plain-English employee summary</h2>
              <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-6">
                {audit.employeeSummary}
              </p>
            </section>

            <section className="grid gap-2">
              <h2 className="font-medium">Formal policy rewrite starter</h2>
              <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-6 whitespace-pre-wrap">
                {audit.formalRewrite}
              </p>
            </section>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
