import type { ControlStatus } from "@prisma/client"

export type ExtractedFinding = {
  status: ControlStatus
  confidence: "high" | "medium" | "low"
  evidence: string
}

export type VendorExtractionResult = {
  modelTraining: ExtractedFinding
  dataRetention: ExtractedFinding
  ssoSupport: ExtractedFinding
  auditLogs: ExtractedFinding
  adminControls: ExtractedFinding
  complianceClaims: ExtractedFinding
  deletionSupport: ExtractedFinding
  termsClarity: ExtractedFinding
  sensitiveDataHandling: ExtractedFinding
  riskSummary: string
  employeeGuidance: string
}

type FindingRule = {
  yes: RegExp[]
  no: RegExp[]
}

const unknownFinding: ExtractedFinding = {
  status: "UNKNOWN",
  confidence: "low",
  evidence: "No explicit statement found in the provided text.",
}

function sentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function findEvidence(text: string, patterns: RegExp[]) {
  return sentences(text).find((sentence) =>
    patterns.some((pattern) => pattern.test(sentence)) &&
    !/(does\s+not\s+discuss|does\s+not\s+mention|no\s+mention\s+of)/i.test(
      sentence
    )
  )
}

function evaluateRule(text: string, rule: FindingRule): ExtractedFinding {
  const noEvidence = findEvidence(text, rule.no)
  if (noEvidence) {
    return { status: "NO", confidence: "medium", evidence: noEvidence }
  }

  const yesEvidence = findEvidence(text, rule.yes)
  if (yesEvidence) {
    return { status: "YES", confidence: "medium", evidence: yesEvidence }
  }

  return unknownFinding
}

const rules: Record<
  keyof Omit<VendorExtractionResult, "riskSummary" | "employeeGuidance">,
  FindingRule
> = {
  modelTraining: {
    yes: [
      /train(?:ing)?\s+(?:our\s+)?models?\s+on\s+(?:your|customer|user)/i,
      /use\s+(?:your|customer|user)\s+data\s+to\s+(?:train|improve)/i,
    ],
    no: [
      /do\s+not\s+(?:use|train).*?(?:customer|user|your)\s+data/i,
      /not\s+used\s+to\s+train/i,
      /will\s+not\s+train/i,
    ],
  },
  dataRetention: {
    yes: [/retain(?:s|ed)?\s+(?:prompts|outputs|content|data)/i, /stored?\s+for\s+\d+\s+days/i],
    no: [/do\s+not\s+retain/i, /deleted\s+immediately/i],
  },
  ssoSupport: {
    yes: [/\bSAML\b/i, /\bSSO\b/i, /single sign-on/i],
    no: [/does\s+not\s+support\s+(?:SAML|SSO|single sign-on)/i],
  },
  auditLogs: {
    yes: [/audit\s+logs?/i, /activity\s+logs?/i],
    no: [/no\s+audit\s+logs?/i, /does\s+not\s+provide\s+audit/i],
  },
  adminControls: {
    yes: [/admin\s+(?:console|controls|dashboard)/i, /workspace\s+administrators/i],
    no: [/no\s+admin\s+(?:console|controls)/i],
  },
  complianceClaims: {
    yes: [/SOC\s*2/i, /ISO\s*27001/i, /HIPAA/i, /FERPA/i],
    no: [/no\s+(?:SOC\s*2|ISO\s*27001|compliance)\s+(?:certification|claims?)/i],
  },
  deletionSupport: {
    yes: [/delete\s+(?:your|customer|user)\s+data/i, /data\s+deletion/i, /right\s+to\s+deletion/i],
    no: [/cannot\s+delete/i, /no\s+data\s+deletion/i],
  },
  termsClarity: {
    yes: [/privacy\s+policy/i, /terms\s+of\s+service/i, /data\s+processing\s+addendum/i],
    no: [/terms\s+(?:are\s+)?(?:unclear|not\s+available)/i],
  },
  sensitiveDataHandling: {
    yes: [/sensitive\s+data/i, /confidential\s+data/i, /regulated\s+data/i],
    no: [/do\s+not\s+(?:submit|upload|enter)\s+sensitive/i],
  },
}

export function extractVendorDocumentation(
  text: string
): VendorExtractionResult {
  const trimmed = text.trim()
  const findings = Object.fromEntries(
    Object.entries(rules).map(([key, rule]) => [
      key,
      evaluateRule(trimmed, rule),
    ])
  ) as Omit<VendorExtractionResult, "riskSummary" | "employeeGuidance">

  const unknowns = Object.entries(findings)
    .filter(([, finding]) => finding.status === "UNKNOWN")
    .map(([key]) => key)

  const riskSummary =
    unknowns.length > 0
      ? `The documentation leaves ${unknowns.length} review field(s) unclear. Keep the tool restricted or under review until missing vendor terms are confirmed.`
      : "The provided documentation covers the main review fields. Confirm the evidence before approving broader use."

  const employeeGuidance =
    findings.modelTraining.status === "YES" ||
    findings.sensitiveDataHandling.status !== "YES"
      ? "Limit use to public or low-sensitivity internal data until a reviewer confirms model-training and sensitive-data terms."
      : "Use may be appropriate within the approved data limits after human review."

  return {
    ...findings,
    riskSummary,
    employeeGuidance,
  }
}

export function extractionFindingsToReviewControls(
  result: VendorExtractionResult
) {
  return {
    modelTraining: result.modelTraining.status,
    dataRetention: result.dataRetention.status,
    ssoSupport: result.ssoSupport.status,
    auditLogs: result.auditLogs.status,
    adminControls: result.adminControls.status,
    complianceClaims: result.complianceClaims.status,
    deletionSupport: result.deletionSupport.status,
    termsClarity: result.termsClarity.status,
    sensitiveDataHandling: result.sensitiveDataHandling.status,
  }
}
