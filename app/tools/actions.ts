"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/db/prisma"
import {
  extractVendorDocumentation,
  extractionFindingsToReviewControls,
} from "@/lib/ai/vendor-extraction"
import { extractVendorDocumentationWithOpenAI } from "@/lib/ai/openai-vendor-extraction"
import { can, type Permission } from "@/lib/auth/permissions"
import { getSession, type AppSession } from "@/lib/auth/session"
import {
  hasToolFormErrors,
  nullableDate,
  nullableText,
  parseToolFormData,
  type ToolFormState,
} from "@/lib/tools/form"
import {
  nullableDate as nullableReviewDate,
  nullableText as nullableReviewText,
  parseVendorReviewFormData,
  scoreVendorReviewForm,
  type VendorReviewFormState,
} from "@/lib/reviews/form"
import { calculateRiskScore } from "@/lib/scoring/risk"

type VendorExtractionActionState = {
  sourceName: string
  sourceText: string
  error?: string
}

async function hasPermission(permission: Permission) {
  const session = await getSession()
  return session ? can(session.role, permission) : false
}

async function requireSession(): Promise<AppSession> {
  const session = await getSession()
  if (!session) {
    throw new Error("No active session")
  }

  return session
}

export async function createToolAction(
  _previousState: ToolFormState,
  formData: FormData
): Promise<ToolFormState> {
  const state = parseToolFormData(formData)

  if (!(await hasPermission("tool:create"))) {
    return {
      values: state.values,
      errors: { form: "You do not have permission to create AI tools." },
    }
  }

  if (hasToolFormErrors(state)) {
    return state
  }

  const session = await requireSession()
  let toolId: string

  try {
    const tool = await prisma.aiTool.create({
      data: {
        organizationId: session.organizationId,
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
  const session = await requireSession()

  if (!(await hasPermission("tool:update"))) {
    return {
      values: state.values,
      errors: { form: "You do not have permission to edit AI tools." },
    }
  }

  if (hasToolFormErrors(state)) {
    return state
  }

  try {
    await prisma.aiTool.update({
      where: {
        id: toolId,
        organizationId: session.organizationId,
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

export async function upsertVendorReviewAction(
  toolId: string,
  _previousState: VendorReviewFormState,
  formData: FormData
): Promise<VendorReviewFormState> {
  const state = parseVendorReviewFormData(formData)
  const session = await requireSession()

  if (!(await hasPermission("review:update"))) {
    return {
      values: state.values,
      errors: { form: "You do not have permission to update vendor reviews." },
    }
  }

  const tool = await prisma.aiTool.findFirst({
    where: { id: toolId, organizationId: session.organizationId },
    select: { allowedDataTypes: true },
  })

  if (!tool) {
    return {
      values: state.values,
      errors: { form: "This AI tool could not be found." },
    }
  }

  const score = scoreVendorReviewForm(state.values, tool.allowedDataTypes)

  await prisma.vendorReview.upsert({
    where: { aiToolId: toolId },
    update: {
      riskScore: score.score,
      riskLevel: score.level,
      modelTraining: state.values.modelTraining,
      dataRetention: state.values.dataRetention,
      ssoSupport: state.values.ssoSupport,
      auditLogs: state.values.auditLogs,
      adminControls: state.values.adminControls,
      complianceClaims: state.values.complianceClaims,
      deletionSupport: state.values.deletionSupport,
      termsClarity: state.values.termsClarity,
      sensitiveDataHandling: state.values.sensitiveDataHandling,
      businessCriticality: state.values.businessCriticality,
      userBaseSize: state.values.userBaseSize,
      topRiskFactors: score.topRiskFactors,
      missingInformation: score.missingInformation,
      recommendation: nullableReviewText(state.values.recommendation),
      reviewedAt: nullableReviewDate(state.values.reviewedAt),
      nextReviewAt: nullableReviewDate(state.values.nextReviewAt),
    },
    create: {
      aiToolId: toolId,
      riskScore: score.score,
      riskLevel: score.level,
      modelTraining: state.values.modelTraining,
      dataRetention: state.values.dataRetention,
      ssoSupport: state.values.ssoSupport,
      auditLogs: state.values.auditLogs,
      adminControls: state.values.adminControls,
      complianceClaims: state.values.complianceClaims,
      deletionSupport: state.values.deletionSupport,
      termsClarity: state.values.termsClarity,
      sensitiveDataHandling: state.values.sensitiveDataHandling,
      businessCriticality: state.values.businessCriticality,
      userBaseSize: state.values.userBaseSize,
      topRiskFactors: score.topRiskFactors,
      missingInformation: score.missingInformation,
      recommendation: nullableReviewText(state.values.recommendation),
      reviewedAt: nullableReviewDate(state.values.reviewedAt),
      nextReviewAt: nullableReviewDate(state.values.nextReviewAt),
    },
  })

  revalidatePath("/")
  revalidatePath("/tools")
  revalidatePath(`/tools/${toolId}`)
  redirect(`/tools/${toolId}`)
}

export async function extractVendorDocumentationAction(
  toolId: string,
  _previousState: VendorExtractionActionState,
  formData: FormData
): Promise<VendorExtractionActionState> {
  const sourceName = String(formData.get("sourceName") ?? "").trim()
  const sourceText = String(formData.get("sourceText") ?? "").trim()
  const session = await requireSession()

  if (!sourceName) {
    return { sourceName, sourceText, error: "Source name or URL is required." }
  }

  if (!(await hasPermission("review:update"))) {
    return {
      sourceName,
      sourceText,
      error: "You do not have permission to extract vendor review fields.",
    }
  }

  if (sourceText.length < 80) {
    return {
      sourceName,
      sourceText,
      error: "Paste at least a paragraph of vendor documentation to extract findings.",
    }
  }

  const tool = await prisma.aiTool.findFirst({
    where: { id: toolId, organizationId: session.organizationId },
    select: { allowedDataTypes: true },
  })

  if (!tool) {
    return { sourceName, sourceText, error: "This AI tool could not be found." }
  }

  let extraction = extractVendorDocumentation(sourceText)
  if (process.env.OPENAI_API_KEY) {
    try {
      extraction = await extractVendorDocumentationWithOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        sourceText,
      })
    } catch (error) {
      console.error(
        "OpenAI extraction failed; using deterministic fallback",
        error
      )
    }
  }
  const controls = extractionFindingsToReviewControls(extraction)
  const score = calculateRiskScore({
    allowedDataTypes: tool.allowedDataTypes,
    ...controls,
    businessCriticality: "LOW",
    userBaseSize: "SMALL",
  })

  await prisma.$transaction([
    prisma.vendorDocumentExtraction.create({
      data: {
        aiToolId: toolId,
        sourceName,
        sourceText,
        findingsJson: extraction,
        riskSummary: extraction.riskSummary,
        employeeGuidance: extraction.employeeGuidance,
      },
    }),
    prisma.vendorReview.upsert({
      where: { aiToolId: toolId },
      update: {
        riskScore: score.score,
        riskLevel: score.level,
        ...controls,
        topRiskFactors: score.topRiskFactors,
        missingInformation: score.missingInformation,
        recommendation: extraction.riskSummary,
      },
      create: {
        aiToolId: toolId,
        riskScore: score.score,
        riskLevel: score.level,
        ...controls,
        businessCriticality: "LOW",
        userBaseSize: "SMALL",
        topRiskFactors: score.topRiskFactors,
        missingInformation: score.missingInformation,
        recommendation: extraction.riskSummary,
      },
    }),
  ])

  revalidatePath("/tools")
  revalidatePath(`/tools/${toolId}`)
  redirect(`/tools/${toolId}`)
}
