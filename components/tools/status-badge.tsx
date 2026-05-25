import type { ToolStatus } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import { TOOL_STATUS_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const statusStyles: Record<ToolStatus, string> = {
  APPROVED:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  RESTRICTED:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  UNDER_REVIEW:
    "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200",
  BLOCKED:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
}

export function StatusBadge({ status }: { status: ToolStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", statusStyles[status])}
    >
      {TOOL_STATUS_LABELS[status]}
    </Badge>
  )
}
