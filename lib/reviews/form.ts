import type {
  BusinessCriticality,
  ControlStatus,
  DataType,
  UserBaseSize,
  VendorReview,
} from "@prisma/client"

import { calculateRiskScore } from "@/lib/scoring/risk"

export const CONTROL_STATUS_OPTIONS = ["YES", "NO", "UNKNOWN"] as const
export const BUSINESS_CRITICALITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"] as const
export const USER_BASE_SIZE_OPTIONS = ["SMALL", "MEDIUM", "LARGE"] as const

export const CONTROL_STATUS_LABELS: Record<ControlStatus, string> = {
  YES: "Yes",
  NO: "No",
  UNKNOWN: "Unknown",
}

export const BUSINESS_CRITICALITY_LABELS: Record<BusinessCriticality, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
}

export const USER_BASE_SIZE_LABELS: Record<UserBaseSize, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
}

export type VendorReviewFormValues = {
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
  recommendation: string
  reviewedAt: string
  nextReviewAt: string
}

export type VendorReviewFormState = {
  values: VendorReviewFormValues
  errors: Partial<Record<keyof VendorReviewFormValues | "form", string>>
}

export const emptyVendorReviewFormValues: VendorReviewFormValues = {
  modelTraining: "UNKNOWN",
  dataRetention: "UNKNOWN",
  ssoSupport: "UNKNOWN",
  auditLogs: "UNKNOWN",
  adminControls: "UNKNOWN",
  complianceClaims: "UNKNOWN",
  deletionSupport: "UNKNOWN",
  termsClarity: "UNKNOWN",
  sensitiveDataHandling: "UNKNOWN",
  businessCriticality: "LOW",
  userBaseSize: "SMALL",
  recommendation: "",
  reviewedAt: "",
  nextReviewAt: "",
}

export function dateInputValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : ""
}

export function nullableDate(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null
}

export function nullableText(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function controlStatus(value: FormDataEntryValue | null): ControlStatus {
  const stringValue = String(value ?? "")
  return CONTROL_STATUS_OPTIONS.includes(stringValue as ControlStatus)
    ? (stringValue as ControlStatus)
    : "UNKNOWN"
}

function businessCriticality(
  value: FormDataEntryValue | null
): BusinessCriticality {
  const stringValue = String(value ?? "")
  return BUSINESS_CRITICALITY_OPTIONS.includes(
    stringValue as BusinessCriticality
  )
    ? (stringValue as BusinessCriticality)
    : "LOW"
}

function userBaseSize(value: FormDataEntryValue | null): UserBaseSize {
  const stringValue = String(value ?? "")
  return USER_BASE_SIZE_OPTIONS.includes(stringValue as UserBaseSize)
    ? (stringValue as UserBaseSize)
    : "SMALL"
}

export function parseVendorReviewFormData(
  formData: FormData
): VendorReviewFormState {
  const values: VendorReviewFormValues = {
    modelTraining: controlStatus(formData.get("modelTraining")),
    dataRetention: controlStatus(formData.get("dataRetention")),
    ssoSupport: controlStatus(formData.get("ssoSupport")),
    auditLogs: controlStatus(formData.get("auditLogs")),
    adminControls: controlStatus(formData.get("adminControls")),
    complianceClaims: controlStatus(formData.get("complianceClaims")),
    deletionSupport: controlStatus(formData.get("deletionSupport")),
    termsClarity: controlStatus(formData.get("termsClarity")),
    sensitiveDataHandling: controlStatus(formData.get("sensitiveDataHandling")),
    businessCriticality: businessCriticality(formData.get("businessCriticality")),
    userBaseSize: userBaseSize(formData.get("userBaseSize")),
    recommendation: String(formData.get("recommendation") ?? "").trim(),
    reviewedAt: String(formData.get("reviewedAt") ?? ""),
    nextReviewAt: String(formData.get("nextReviewAt") ?? ""),
  }

  return { values, errors: {} }
}

export function vendorReviewToFormValues(
  review: VendorReview | null | undefined
): VendorReviewFormValues {
  if (!review) {
    return emptyVendorReviewFormValues
  }

  return {
    modelTraining: review.modelTraining,
    dataRetention: review.dataRetention,
    ssoSupport: review.ssoSupport,
    auditLogs: review.auditLogs,
    adminControls: review.adminControls,
    complianceClaims: review.complianceClaims,
    deletionSupport: review.deletionSupport,
    termsClarity: review.termsClarity,
    sensitiveDataHandling: review.sensitiveDataHandling,
    businessCriticality: review.businessCriticality,
    userBaseSize: review.userBaseSize,
    recommendation: review.recommendation ?? "",
    reviewedAt: dateInputValue(review.reviewedAt),
    nextReviewAt: dateInputValue(review.nextReviewAt),
  }
}

export function scoreVendorReviewForm(
  values: VendorReviewFormValues,
  allowedDataTypes: DataType[]
) {
  return calculateRiskScore({
    allowedDataTypes,
    modelTraining: values.modelTraining,
    dataRetention: values.dataRetention,
    ssoSupport: values.ssoSupport,
    auditLogs: values.auditLogs,
    adminControls: values.adminControls,
    complianceClaims: values.complianceClaims,
    deletionSupport: values.deletionSupport,
    termsClarity: values.termsClarity,
    sensitiveDataHandling: values.sensitiveDataHandling,
    businessCriticality: values.businessCriticality,
    userBaseSize: values.userBaseSize,
  })
}
