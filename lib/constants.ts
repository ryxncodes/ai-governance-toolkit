import type { DataType, ToolStatus } from "@prisma/client"

export const DEFAULT_ORG_NAME = "Demo Organization"

export const TOOL_STATUS_LABELS: Record<ToolStatus, string> = {
  APPROVED: "Approved",
  RESTRICTED: "Restricted",
  UNDER_REVIEW: "Under Review",
  BLOCKED: "Blocked",
}

export const TOOL_STATUS_OPTIONS = [
  "APPROVED",
  "RESTRICTED",
  "UNDER_REVIEW",
  "BLOCKED",
] as const satisfies readonly ToolStatus[]

export const DATA_TYPE_LABELS: Record<DataType, string> = {
  PUBLIC: "Public data",
  INTERNAL: "Internal business data",
  CONFIDENTIAL: "Confidential data",
  CUSTOMER: "Customer data",
  SOURCE_CODE: "Source code",
  CREDENTIALS: "Credentials/secrets",
  REGULATED: "Student/patient/regulated data",
}

export const DATA_TYPE_OPTIONS = [
  "PUBLIC",
  "INTERNAL",
  "CONFIDENTIAL",
  "CUSTOMER",
  "SOURCE_CODE",
  "CREDENTIALS",
  "REGULATED",
] as const satisfies readonly DataType[]

export const DATA_TYPE_SHORT_LABELS: Record<DataType, string> = {
  PUBLIC: "Public",
  INTERNAL: "Internal",
  CONFIDENTIAL: "Confidential",
  CUSTOMER: "Customer",
  SOURCE_CODE: "Source code",
  CREDENTIALS: "Credentials",
  REGULATED: "Regulated",
}
