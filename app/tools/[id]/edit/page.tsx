import { notFound } from "next/navigation"

import { updateToolAction } from "@/app/tools/actions"
import { ToolForm } from "@/components/tools/tool-form"
import { prisma } from "@/lib/db/prisma"
import { DEMO_ORG_ID } from "@/lib/organizations"
import {
  dateInputValue,
  type ToolFormState,
  type ToolFormValues,
} from "@/lib/tools/form"

export const dynamic = "force-dynamic"

export default async function EditToolPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tool = await prisma.aiTool.findFirst({
    where: { id, organizationId: DEMO_ORG_ID },
  })

  if (!tool) {
    notFound()
  }

  const values: ToolFormValues = {
    name: tool.name,
    vendor: tool.vendor,
    website: tool.website ?? "",
    category: tool.category,
    status: tool.status,
    description: tool.description ?? "",
    approvedUseCases: tool.approvedUseCases ?? "",
    blockedUseCases: tool.blockedUseCases ?? "",
    allowedDataTypes: tool.allowedDataTypes,
    reviewOwner: tool.reviewOwner ?? "",
    reviewDate: dateInputValue(tool.reviewDate),
    nextReviewDate: dateInputValue(tool.nextReviewDate),
    notes: tool.notes ?? "",
  }

  const initialState: ToolFormState = {
    values,
    errors: {},
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit {tool.name}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Update registry details, use conditions, and review metadata.
        </p>
      </div>
      <ToolForm
        action={updateToolAction.bind(null, tool.id)}
        initialState={initialState}
        cancelHref={`/tools/${tool.id}`}
        submitLabel="Save changes"
      />
    </div>
  )
}
