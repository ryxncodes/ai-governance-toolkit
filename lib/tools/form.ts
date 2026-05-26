import type { DataType, ToolStatus } from "@prisma/client"

import { DATA_TYPE_OPTIONS, TOOL_STATUS_OPTIONS } from "@/lib/constants"

export type ToolFormValues = {
  name: string
  vendor: string
  website: string
  category: string
  status: ToolStatus
  description: string
  approvedUseCases: string
  blockedUseCases: string
  allowedDataTypes: DataType[]
  reviewOwner: string
  reviewDate: string
  nextReviewDate: string
  notes: string
}

export type ToolFormState = {
  values: ToolFormValues
  errors: Partial<Record<keyof ToolFormValues | "form", string>>
}

export const emptyToolFormValues: ToolFormValues = {
  name: "",
  vendor: "",
  website: "",
  category: "",
  status: "UNDER_REVIEW",
  description: "",
  approvedUseCases: "",
  blockedUseCases: "",
  allowedDataTypes: [],
  reviewOwner: "",
  reviewDate: "",
  nextReviewDate: "",
  notes: "",
}

export function dateInputValue(date: Date | null | undefined) {
  if (!date) {
    return ""
  }

  return date.toISOString().slice(0, 10)
}

export function nullableText(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function nullableDate(value: string) {
  if (!value) {
    return null
  }

  return new Date(`${value}T00:00:00.000Z`)
}

export function parseToolFormData(formData: FormData): ToolFormState {
  const status = String(formData.get("status") ?? "")
  const allowedDataTypes = formData
    .getAll("allowedDataTypes")
    .map(String)
    .filter((value): value is DataType =>
      DATA_TYPE_OPTIONS.includes(value as DataType)
    )

  const values: ToolFormValues = {
    name: String(formData.get("name") ?? "").trim(),
    vendor: String(formData.get("vendor") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    status: TOOL_STATUS_OPTIONS.includes(status as ToolStatus)
      ? (status as ToolStatus)
      : "UNDER_REVIEW",
    description: String(formData.get("description") ?? "").trim(),
    approvedUseCases: String(formData.get("approvedUseCases") ?? "").trim(),
    blockedUseCases: String(formData.get("blockedUseCases") ?? "").trim(),
    allowedDataTypes,
    reviewOwner: String(formData.get("reviewOwner") ?? "").trim(),
    reviewDate: String(formData.get("reviewDate") ?? ""),
    nextReviewDate: String(formData.get("nextReviewDate") ?? ""),
    notes: String(formData.get("notes") ?? "").trim(),
  }

  const errors: ToolFormState["errors"] = {}

  if (!values.name) {
    errors.name = "Tool name is required."
  }

  if (!values.vendor) {
    errors.vendor = "Vendor is required."
  }

  if (!values.category) {
    errors.category = "Category is required."
  }

  if (!TOOL_STATUS_OPTIONS.includes(values.status)) {
    errors.status = "Choose a valid status."
  }

  return { values, errors }
}

export function hasToolFormErrors(state: ToolFormState) {
  return Object.keys(state.errors).length > 0
}
