-- CreateTable
CREATE TABLE "VendorDocumentExtraction" (
    "id" TEXT NOT NULL,
    "aiToolId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "findingsJson" JSONB NOT NULL,
    "riskSummary" TEXT NOT NULL,
    "employeeGuidance" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorDocumentExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorDocumentExtraction_aiToolId_idx" ON "VendorDocumentExtraction"("aiToolId");

-- CreateIndex
CREATE INDEX "VendorDocumentExtraction_createdAt_idx" ON "VendorDocumentExtraction"("createdAt");

-- AddForeignKey
ALTER TABLE "VendorDocumentExtraction" ADD CONSTRAINT "VendorDocumentExtraction_aiToolId_fkey" FOREIGN KEY ("aiToolId") REFERENCES "AiTool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
