import { ToolsTable } from "@/components/tools/tools-table"
import { buttonVariants } from "@/components/ui/button"
import { prisma } from "@/lib/db/prisma"
import { DEMO_ORG_ID } from "@/lib/organizations"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ToolsPage() {
  const tools = await prisma.aiTool.findMany({
    where: { organizationId: DEMO_ORG_ID },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Tools</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Approved AI tool registry. Track vendor, status, allowed data types,
            and review dates for your organization.
          </p>
        </div>
        <Link href="/tools/new" className={buttonVariants()}>
          Add tool
        </Link>
      </div>
      <ToolsTable tools={tools} />
    </div>
  )
}
