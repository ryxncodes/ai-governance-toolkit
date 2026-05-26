import type { AiTool, VendorReview } from "@prisma/client"
import Link from "next/link"

import { RiskBadge } from "@/components/reviews/risk-badge"
import { DataTypesBadges } from "@/components/tools/data-types-badges"
import { StatusBadge } from "@/components/tools/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"

type ToolRow = AiTool & { vendorReview: VendorReview | null }

export function ToolsTable({ tools }: { tools: ToolRow[] }) {
  if (tools.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No AI tools in the registry yet. Run{" "}
        <code className="rounded bg-muted px-1 py-0.5">npm run db:seed</code>{" "}
        after configuring your database.
      </p>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk level</TableHead>
            <TableHead>Allowed data</TableHead>
            <TableHead>Last reviewed</TableHead>
            <TableHead>Next review</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tools.map((tool) => (
            <TableRow key={tool.id}>
              <TableCell className="font-medium">{tool.name}</TableCell>
              <TableCell>{tool.vendor}</TableCell>
              <TableCell className="max-w-[180px] truncate">
                {tool.category}
              </TableCell>
              <TableCell>
                <StatusBadge status={tool.status} />
              </TableCell>
              <TableCell>
                {tool.vendorReview ? (
                  <div className="flex items-center gap-2">
                    <RiskBadge level={tool.vendorReview.riskLevel} />
                    <span className="text-xs text-muted-foreground">
                      {tool.vendorReview.riskScore}
                    </span>
                  </div>
                ) : (
                  <Badge variant="secondary">Not reviewed</Badge>
                )}
              </TableCell>
              <TableCell>
                <DataTypesBadges dataTypes={tool.allowedDataTypes} />
              </TableCell>
              <TableCell>{formatDate(tool.reviewDate)}</TableCell>
              <TableCell>{formatDate(tool.nextReviewDate)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/tools/${tool.id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                          })}
                        >
                          View
                        </Link>
                      }
                    />
                    <TooltipContent>View tool details</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/tools/${tool.id}/edit`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                          })}
                        >
                          Edit
                        </Link>
                      }
                    />
                    <TooltipContent>Edit registry entry</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
