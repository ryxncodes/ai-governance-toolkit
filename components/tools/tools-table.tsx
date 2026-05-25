import type { AiTool } from "@prisma/client"

import { DataTypesBadges } from "@/components/tools/data-types-badges"
import { StatusBadge } from "@/components/tools/status-badge"
import { Button } from "@/components/ui/button"
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
import { formatDate } from "@/lib/format"

export function ToolsTable({ tools }: { tools: AiTool[] }) {
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
              <TableCell className="text-muted-foreground">—</TableCell>
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
                        <Button variant="ghost" size="sm" disabled>
                          View
                        </Button>
                      }
                    />
                    <TooltipContent>Available in Step 2</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button variant="ghost" size="sm" disabled>
                          Edit
                        </Button>
                      }
                    />
                    <TooltipContent>Available in Step 2</TooltipContent>
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
