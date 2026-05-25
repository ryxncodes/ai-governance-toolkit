-- CreateEnum
CREATE TYPE "ToolStatus" AS ENUM ('APPROVED', 'RESTRICTED', 'UNDER_REVIEW', 'BLOCKED');

-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'CUSTOMER', 'SOURCE_CODE', 'CREDENTIALS', 'REGULATED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiTool" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "website" TEXT,
    "category" TEXT NOT NULL,
    "status" "ToolStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "description" TEXT,
    "approvedUseCases" TEXT,
    "blockedUseCases" TEXT,
    "allowedDataTypes" "DataType"[],
    "reviewOwner" TEXT,
    "reviewDate" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiTool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiTool_organizationId_idx" ON "AiTool"("organizationId");

-- CreateIndex
CREATE INDEX "AiTool_status_idx" ON "AiTool"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AiTool_organizationId_name_key" ON "AiTool"("organizationId", "name");

-- AddForeignKey
ALTER TABLE "AiTool" ADD CONSTRAINT "AiTool_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
