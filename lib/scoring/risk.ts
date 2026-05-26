import type {
  BusinessCriticality,
  ControlStatus,
  DataType,
  RiskLevel,
  ToolStatus,
  UserBaseSize,
} from "@prisma/client"

export type RiskScoringInput = {
  allowedDataTypes: DataType[]
  modelTraining: ControlStatus
  dataRetention: ControlStatus
  ssoSupport: ControlStatus
  auditLogs: ControlStatus
  adminControls: ControlStatus
  complianceClaims: ControlStatus
  deletionSupport: ControlStatus
  termsClarity: ControlStatus
  sensitiveDataHandling: ControlStatus
  businessCriticality: BusinessCriticality
  userBaseSize: UserBaseSize
}

export type RiskFactor = {
  label: string
  points: number
}

export type RiskScoreResult = {
  score: number
  level: RiskLevel
  recommendedStatus: ToolStatus
  topRiskFactors: string[]
  missingInformation: string[]
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score))
}

export function riskLevelForScore(score: number): RiskLevel {
  if (score >= 75) {
    return "CRITICAL"
  }

  if (score >= 50) {
    return "HIGH"
  }

  if (score >= 25) {
    return "MEDIUM"
  }

  return "LOW"
}

export function recommendedStatusForScore(score: number): ToolStatus {
  if (score >= 75) {
    return "BLOCKED"
  }

  if (score >= 50) {
    return "UNDER_REVIEW"
  }

  if (score >= 25) {
    return "RESTRICTED"
  }

  return "APPROVED"
}

export function calculateRiskScore(input: RiskScoringInput): RiskScoreResult {
  const factors: RiskFactor[] = []
  const missingInformation: string[] = []

  function add(label: string, points: number) {
    factors.push({ label, points })
  }

  function markUnknown(field: string, points: number) {
    add(`${field} is unknown`, points)
    missingInformation.push(field)
  }

  for (const dataType of input.allowedDataTypes) {
    if (dataType === "PUBLIC") add("Use is limited to public data", -10)
    if (dataType === "INTERNAL") add("Internal business data may be used", 5)
    if (dataType === "CONFIDENTIAL") add("Confidential data may be used", 15)
    if (dataType === "CUSTOMER") add("Customer data may be used", 20)
    if (dataType === "SOURCE_CODE") add("Source code may be used", 15)
    if (dataType === "CREDENTIALS") add("Credentials or secrets may be used", 30)
    if (dataType === "REGULATED") add("Regulated data may be used", 30)
  }

  if (input.modelTraining === "YES") {
    add("Vendor may train models on submitted data", 25)
  } else if (input.modelTraining === "UNKNOWN") {
    markUnknown("Model training terms", 15)
  }

  if (input.dataRetention === "YES") {
    add("Vendor retains prompts or outputs", 15)
  } else if (input.dataRetention === "UNKNOWN") {
    markUnknown("Data retention policy", 10)
  }

  if (input.ssoSupport === "YES") add("SSO is available", -5)
  if (input.ssoSupport === "NO") add("No SSO support", 10)
  if (input.ssoSupport === "UNKNOWN") markUnknown("SSO support", 5)

  if (input.auditLogs === "NO") add("No audit logs", 10)
  if (input.auditLogs === "UNKNOWN") markUnknown("Audit logging", 5)

  if (input.adminControls === "NO") add("No admin controls", 10)
  if (input.adminControls === "UNKNOWN") markUnknown("Admin controls", 5)

  if (input.complianceClaims === "YES") add("Compliance claims are documented", -5)
  if (input.complianceClaims === "NO") add("No compliance claims found", 5)
  if (input.complianceClaims === "UNKNOWN") {
    markUnknown("Compliance claims", 5)
  }

  if (input.deletionSupport === "NO") add("No data deletion support", 10)
  if (input.deletionSupport === "UNKNOWN") {
    markUnknown("Data deletion support", 5)
  }

  if (input.termsClarity === "NO") add("Terms are unclear", 10)
  if (input.termsClarity === "UNKNOWN") markUnknown("Terms clarity", 10)

  if (input.sensitiveDataHandling === "YES") {
    add("Sensitive data handling is documented", -5)
  }
  if (input.sensitiveDataHandling === "NO") {
    add("Sensitive data handling is not documented", 20)
  }
  if (input.sensitiveDataHandling === "UNKNOWN") {
    markUnknown("Sensitive data handling", 15)
  }

  if (input.businessCriticality === "MEDIUM") add("Medium business criticality", 8)
  if (input.businessCriticality === "HIGH") add("High business criticality", 15)

  if (input.userBaseSize === "MEDIUM") add("Medium user base", 5)
  if (input.userBaseSize === "LARGE") add("Large user base", 10)

  const score = clampScore(
    factors.reduce((total, factor) => total + factor.points, 0)
  )
  const level = riskLevelForScore(score)

  const topRiskFactors = factors
    .filter((factor) => factor.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map((factor) => factor.label)

  return {
    score,
    level,
    recommendedStatus: recommendedStatusForScore(score),
    topRiskFactors,
    missingInformation,
  }
}
