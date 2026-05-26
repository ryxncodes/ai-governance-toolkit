"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/db/prisma"
import { DEMO_ORG_ID } from "@/lib/organizations"
import {
  hasToolFormErrors,
  nullableDate,
  nullableText,
  parseToolFormData,
  type ToolFormState,
} from "@/lib/tools/form"

export async function createToolAction(
  _previousState: ToolFormState,
  formData: FormData
): Promise<ToolFormState> {
  const state = parseToolFormData(formData)

  if (hasToolFormErrors(state)) {
    return state
  }

  let toolId: string

  try {
    const tool = await prisma.aiTool.create({
      data: {
        organizationId: DEMO_ORG_ID,
        name: state.values.name,
        vendor: state.values.vendor,
        website: nullableText(state.values.website),
        category: state.values.category,
        status: state.values.status,
        description: nullableText(state.values.description),
        approvedUseCases: nullableText(state.values.approvedUseCases),
        blockedUseCases: nullableText(state.values.blockedUseCases),
        allowedDataTypes: state.values.allowedDataTypes,
        reviewOwner: nullableText(state.values.reviewOwner),
        reviewDate: nullableDate(state.values.reviewDate),
        nextReviewDate: nullableDate(state.values.nextReviewDate),
        notes: nullableText(state.values.notes),
      },
      select: { id: true },
    })

    toolId = tool.id
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        values: state.values,
        errors: {
          form: "A tool with this name already exists in this organization.",
        },
      }
    }

    throw error
  }

  revalidatePath("/")
  revalidatePath("/tools")
  redirect(`/tools/${toolId}`)
}

export async function updateToolAction(
  toolId: string,
  _previousState: ToolFormState,
  formData: FormData
): Promise<ToolFormState> {
  const state = parseToolFormData(formData)

  if (hasToolFormErrors(state)) {
    return state
  }

  try {
    await prisma.aiTool.update({
      where: {
        id: toolId,
        organizationId: DEMO_ORG_ID,
      },
      data: {
        name: state.values.name,
        vendor: state.values.vendor,
        website: nullableText(state.values.website),
        category: state.values.category,
        status: state.values.status,
        description: nullableText(state.values.description),
        approvedUseCases: nullableText(state.values.approvedUseCases),
        blockedUseCases: nullableText(state.values.blockedUseCases),
        allowedDataTypes: state.values.allowedDataTypes,
        reviewOwner: nullableText(state.values.reviewOwner),
        reviewDate: nullableDate(state.values.reviewDate),
        nextReviewDate: nullableDate(state.values.nextReviewDate),
        notes: nullableText(state.values.notes),
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        values: state.values,
        errors: {
          form: "A tool with this name already exists in this organization.",
        },
      }
    }

    throw error
  }

  revalidatePath("/")
  revalidatePath("/tools")
  revalidatePath(`/tools/${toolId}`)
  redirect(`/tools/${toolId}`)
}
