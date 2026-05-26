import { PrismaClient, type DataType, type ToolStatus } from "@prisma/client"
import { readFileSync } from "fs"
import { join } from "path"

import { DEFAULT_ORG_NAME } from "../lib/constants"
import {
  DEMO_ORG_ID,
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
} from "../lib/organizations"

const prisma = new PrismaClient()

type DemoToolJson = {
  name: string
  vendor: string
  website: string | null
  category: string
  status: string
  description: string | null
  approvedUseCases: string | null
  blockedUseCases: string | null
  allowedDataTypes: string[]
  reviewOwner: string | null
  reviewDate: string | null
  nextReviewDate: string | null
  notes: string | null
}

async function main() {
  const organization = await prisma.organization.upsert({
    where: { id: DEMO_ORG_ID },
    update: { name: DEFAULT_ORG_NAME },
    create: {
      id: DEMO_ORG_ID,
      name: DEFAULT_ORG_NAME,
    },
  })

  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {
      email: DEMO_USER_EMAIL,
      name: "Demo IT Owner",
    },
    create: {
      id: DEMO_USER_ID,
      email: DEMO_USER_EMAIL,
      name: "Demo IT Owner",
    },
  })

  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
    update: { role: "OWNER" },
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: "OWNER",
    },
  })

  const filePath = join(process.cwd(), "sample-data", "demo-tools.json")
  const tools = JSON.parse(readFileSync(filePath, "utf-8")) as DemoToolJson[]

  for (const tool of tools) {
    await prisma.aiTool.upsert({
      where: {
        organizationId_name: {
          organizationId: organization.id,
          name: tool.name,
        },
      },
      update: {
        vendor: tool.vendor,
        website: tool.website,
        category: tool.category,
        status: tool.status as ToolStatus,
        description: tool.description,
        approvedUseCases: tool.approvedUseCases,
        blockedUseCases: tool.blockedUseCases,
        allowedDataTypes: tool.allowedDataTypes as DataType[],
        reviewOwner: tool.reviewOwner,
        reviewDate: tool.reviewDate ? new Date(tool.reviewDate) : null,
        nextReviewDate: tool.nextReviewDate
          ? new Date(tool.nextReviewDate)
          : null,
        notes: tool.notes,
      },
      create: {
        organizationId: organization.id,
        name: tool.name,
        vendor: tool.vendor,
        website: tool.website,
        category: tool.category,
        status: tool.status as ToolStatus,
        description: tool.description,
        approvedUseCases: tool.approvedUseCases,
        blockedUseCases: tool.blockedUseCases,
        allowedDataTypes: tool.allowedDataTypes as DataType[],
        reviewOwner: tool.reviewOwner,
        reviewDate: tool.reviewDate ? new Date(tool.reviewDate) : null,
        nextReviewDate: tool.nextReviewDate
          ? new Date(tool.nextReviewDate)
          : null,
        notes: tool.notes,
      },
    })
  }

  console.log(
    `Seeded ${tools.length} AI tools and demo owner for "${organization.name}".`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
