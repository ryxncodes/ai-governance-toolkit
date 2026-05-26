import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  extractVendorDocumentation,
  extractionFindingsToReviewControls,
} from "@/lib/ai/vendor-extraction"

describe("vendor documentation extraction", () => {
  it("extracts positive controls with supporting evidence", () => {
    const result = extractVendorDocumentation(`
      Our enterprise plan supports SAML SSO and provides audit logs.
      Workspace administrators can manage users from an admin console.
      We maintain SOC 2 Type II and ISO 27001 compliance reports.
      Customers may request data deletion through the privacy portal.
      Customer prompts are not used to train our models.
      Our privacy policy explains how sensitive data is handled.
    `)

    assert.equal(result.modelTraining.status, "NO")
    assert.equal(result.ssoSupport.status, "YES")
    assert.equal(result.auditLogs.status, "YES")
    assert.equal(result.adminControls.status, "YES")
    assert.equal(result.complianceClaims.status, "YES")
    assert.equal(result.deletionSupport.status, "YES")
    assert.match(result.modelTraining.evidence, /not used to train/i)
  })

  it("keeps unsupported fields unknown and maps findings to review controls", () => {
    const result = extractVendorDocumentation(`
      This vendor has a general terms of service. The page does not discuss
      SSO, audit logs, model training, deletion workflows, or admin controls.
    `)

    const controls = extractionFindingsToReviewControls(result)

    assert.equal(result.ssoSupport.status, "UNKNOWN")
    assert.equal(result.modelTraining.status, "UNKNOWN")
    assert.equal(controls.termsClarity, "YES")
    assert.match(result.riskSummary, /unclear/i)
  })
})
