import type { DataType } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import { DATA_TYPE_SHORT_LABELS } from "@/lib/constants"

export function DataTypesBadges({
  dataTypes,
  maxVisible = 3,
}: {
  dataTypes: DataType[]
  maxVisible?: number
}) {
  if (dataTypes.length === 0) {
    return <span className="text-sm text-muted-foreground">None</span>
  }

  const visible = dataTypes.slice(0, maxVisible)
  const remaining = dataTypes.length - visible.length

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((type) => (
        <Badge key={type} variant="secondary" className="text-xs">
          {DATA_TYPE_SHORT_LABELS[type]}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remaining}
        </Badge>
      )}
    </div>
  )
}
