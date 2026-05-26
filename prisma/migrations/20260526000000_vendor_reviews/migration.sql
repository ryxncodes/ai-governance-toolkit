-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ControlStatus" AS ENUM ('YES', 'NO', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "BusinessCriticality" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "UserBaseSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateTable
CREATE TABLE "VendorReview" (
    "id" TEXT NOT NULL,
    "aiToolId" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "modelTraining" "ControlStatus" NOT NULL DEFAULT 'UNKNOWN',
    "dataRetention" "ControlStatus" NOT NULL DEFAULT 'UNKNOWN',
    "ssoSupport" "ControlStatus" NOT NULL DEFAULT 'UNKNOWN',
    "auditLogs" "ControlStatus" NOT NULL DEFAULT 'UNKNOWN',
    "adminControls" "ControlStatus" NOT NULL DEFAULT 'UNKNOWN',
    "complianceClaims" "ControlStatus" NOT NULL DEFAULT 'UNKNOWN',
    "deletionSupport" "ControlStatus" NOT NULL DEFAULT 'UNKNOWN',
    "termsClarity" "ControlStatus" NOT NULL DEFAULT 'UNKNOWN',
    "sensitiveDataHandling" "ControlStatus" NOT NULL DEFAULT 'UNKNOWN',
    "businessCriticality" "BusinessCriticality" NOT NULL DEFAULT 'LOW',
    "userBaseSize" "UserBaseSize" NOT NULL DEFAULT 'SMALL',
    "topRiskFactors" TEXT[],
    "missingInformation" TEXT[],
    "recommendation" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorReview_aiToolId_key" ON "VendorReview"("aiToolId");

-- CreateIndex
CREATE INDEX "VendorReview_riskLevel_idx" ON "VendorReview"("riskLevel");

-- AddForeignKey
ALTER TABLE "VendorReview" ADD CONSTRAINT "VendorReview_aiToolId_fkey" FOREIGN KEY ("aiToolId") REFERENCES "AiTool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
