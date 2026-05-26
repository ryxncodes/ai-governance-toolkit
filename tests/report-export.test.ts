import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  csvCell,
  generateApprovedToolsMarkdown,
  generateRiskRegisterCsv,
} from "@/lib/reports/export"

describe("report exports", () => {
  it("escapes CSV cells containing commas and quotes", () => {
    assert.equal(csvCell('Chat, "AI"'), '"Chat, ""AI"""')
  })

  it("generates approved tools markdown", () => {
    const markdown = generateApprovedToolsMarkdown([
      {
        id: "tool-1",
        organizationId: "org-1",
        name: "ChatGPT",
        vendor: "OpenAI",
        website: "https://example.com",
        category: "Assistant",
        status: "APPROVED",
        description: null,
        approvedUseCases: "Draft internal FAQs",
        blockedUseCases: "Secrets",
        allowedDataTypes: ["PUBLIC"],
        reviewOwner: null,
        reviewDate: null,
        nextReviewDate: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    assert.match(markdown, /Approved AI Tools/)
    assert.match(markdown, /ChatGPT/)
    assert.match(markdown, /Draft internal FAQs/)
  })

  it("generates risk register CSV with reviewed and unreviewed tools", () => {
    const csv = generateRiskRegisterCsv([
      {
        id: "tool-1",
        organizationId: "org-1",
        name: "ChatGPT",
        vendor: "OpenAI",
        website: null,
        category: "Assistant",
        status: "APPROVED",
        description: null,
        approvedUseCases: null,
        blockedUseCases: null,
        allowedDataTypes: ["PUBLIC"],
        reviewOwner: null,
        reviewDate: null,
        nextReviewDate: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        vendorReview: null,
      },
    ])

    assert.match(csv, /Tool,Vendor,Category/)
    assert.match(csv, /Not reviewed/)
  })
})
