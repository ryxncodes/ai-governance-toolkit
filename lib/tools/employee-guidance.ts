import type { ToolStatus } from "@prisma/client"

export function isEmployeeVisibleStatus(status: ToolStatus) {
  return status === "APPROVED" || status === "RESTRICTED"
}

export function employeeStatusSummary(status: ToolStatus) {
  if (status === "APPROVED") {
    return "Approved within the listed use and data limits."
  }

  if (status === "RESTRICTED") {
    return "Restricted to the listed teams, use cases, or data types."
  }

  if (status === "UNDER_REVIEW") {
    return "Not approved for company work while review is in progress."
  }

  return "Blocked for company work."
}
