import type { AiTool, DataType, Policy, VendorReview } from "@prisma/client"

import { DATA_TYPE_LABELS, TOOL_STATUS_LABELS } from "@/lib/constants"
import type { PolicyAuditResult } from "@/lib/policies/audit"

export type ToolWithReview = AiTool & { vendorReview: VendorReview | null }

function line(value: string | null | undefined) {
  return value?.trim() ? value.trim() : "Not specified"
}

function dataTypes(types: DataType[]) {
  return types.length > 0
    ? types.map((type) => DATA_TYPE_LABELS[type]).join(", ")
    : "None"
}

export function csvCell(value: string | number | null | undefined) {
  const stringValue = String(value ?? "")
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

export function generateApprovedToolsMarkdown(tools: AiTool[]) {
  const rows = tools
    .map(
      (tool) => `## ${tool.name}

- Vendor: ${tool.vendor}
- Category: ${tool.category}
- Status: ${TOOL_STATUS_LABELS[tool.status]}
- Allowed data: ${dataTypes(tool.allowedDataTypes)}

### Approved Use

${line(tool.approvedUseCases)}

### Do Not Use For

${line(tool.blockedUseCases)}
`
    )
    .join("\n")

  return `# Approved AI Tools - Employee Guide

This guide lists approved and restricted AI tools and the conditions for use.

${rows || "No approved or restricted tools are available."}
`
}

export function generateVendorReviewMarkdown(tool: ToolWithReview) {
  const review = tool.vendorReview

  return `# ${tool.name} Vendor Review

- Vendor: ${tool.vendor}
- Website: ${line(tool.website)}
- Category: ${tool.category}
- Registry status: ${TOOL_STATUS_LABELS[tool.status]}
- Allowed data: ${dataTypes(tool.allowedDataTypes)}
- Risk level: ${review?.riskLevel ?? "Not reviewed"}
- Risk score: ${review?.riskScore ?? "Not reviewed"}

## Approved Use Cases

${line(tool.approvedUseCases)}

## Blocked Use Cases

${line(tool.blockedUseCases)}

## Top Risk Factors

${review?.topRiskFactors.length ? review.topRiskFactors.map((item) => `- ${item}`).join("\n") : "Not reviewed"}

## Missing Information

${review?.missingInformation.length ? review.missingInformation.map((item) => `- ${item}`).join("\n") : "Not reviewed"}

## Reviewer Recommendation

${line(review?.recommendation)}
`
}

export function generateRiskRegisterCsv(tools: ToolWithReview[]) {
  const header = [
    "Tool",
    "Vendor",
    "Category",
    "Status",
    "Risk Level",
    "Risk Score",
    "Allowed Data",
    "Top Risk Factors",
  ]

  const rows = tools.map((tool) => [
    tool.name,
    tool.vendor,
    tool.category,
    TOOL_STATUS_LABELS[tool.status],
    tool.vendorReview?.riskLevel ?? "Not reviewed",
    tool.vendorReview?.riskScore ?? "",
    dataTypes(tool.allowedDataTypes),
    tool.vendorReview?.topRiskFactors.join("; ") ?? "",
  ])

  return [header, ...rows]
    .map((row) => row.map((cell) => csvCell(cell)).join(","))
    .join("\n")
}

export function generatePolicyGapMarkdown(policy: Policy) {
  const audit = policy.auditJson as PolicyAuditResult

  return `# ${policy.title} - AI Policy Gap Report

- Completeness score: ${policy.score}/100

## Missing Sections

${audit.missingSections.length ? audit.missingSections.map((item) => `- ${item}`).join("\n") : "No missing sections detected."}

## Risky Language

${audit.riskyLanguage.length ? audit.riskyLanguage.map((item) => `- ${item}`).join("\n") : "No risky language detected."}

## Suggested Additions

${audit.suggestedAdditions.length ? audit.suggestedAdditions.map((item) => `- ${item}`).join("\n") : "No suggested additions."}

## Plain-English Employee Summary

${audit.employeeSummary}

## Formal Policy Rewrite Starter

${audit.formalRewrite}
`
}
