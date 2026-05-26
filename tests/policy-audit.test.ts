import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { auditPolicy } from "@/lib/policies/audit"

describe("policy audit", () => {
  it("scores broad policies and flags missing sections", () => {
    const result = auditPolicy(`
      Approved AI tools are listed in the company registry. Prohibited tools
      are blocked by IT. Public data and confidential data follow our data
      classification rules. Customer data and source code require vendor review.
      Credentials, secrets, passwords, and API keys must never be entered.
      Regulated data and student data require written approval. Employees are
      responsible for human review and must verify AI output before use. Incident
      reporting is required for accidental disclosure. Browser extensions and
      meeting transcription tools require security review. Legal, HR, and finance
      decisions may not rely solely on AI. This policy has an annual review cadence.
    `)

    assert.ok(result.score >= 80)
    assert.equal(result.riskyLanguage.length, 0)
    assert.ok(result.missingSections.length <= 2)
  })

  it("penalizes risky permissive language", () => {
    const result = auditPolicy(`
      Employees may use any AI tool with no restrictions. Confidential data may
      be entered into AI systems. This short policy mentions approved AI tools
      but does not explain vendor review, incident reporting, credentials, source
      code, customer data, meeting transcription, browser extensions, or review cadence.
    `)

    assert.ok(result.score < 50)
    assert.ok(result.riskyLanguage.length >= 2)
    assert.ok(result.suggestedAdditions.length > 0)
  })
})
