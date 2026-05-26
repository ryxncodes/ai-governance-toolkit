import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  calculateRiskScore,
  recommendedStatusForScore,
  riskLevelForScore,
} from "@/lib/scoring/risk"

describe("risk scoring", () => {
  it("keeps public-data tools with strong controls low risk", () => {
    const result = calculateRiskScore({
      allowedDataTypes: ["PUBLIC"],
      modelTraining: "NO",
      dataRetention: "NO",
      ssoSupport: "YES",
      auditLogs: "YES",
      adminControls: "YES",
      complianceClaims: "YES",
      deletionSupport: "YES",
      termsClarity: "YES",
      sensitiveDataHandling: "YES",
      businessCriticality: "LOW",
      userBaseSize: "SMALL",
    })

    assert.equal(result.score, 0)
    assert.equal(result.level, "LOW")
    assert.equal(result.recommendedStatus, "APPROVED")
    assert.deepEqual(result.missingInformation, [])
  })

  it("escalates unknown vendor terms and sensitive data to high risk", () => {
    const result = calculateRiskScore({
      allowedDataTypes: ["CUSTOMER", "REGULATED"],
      modelTraining: "UNKNOWN",
      dataRetention: "UNKNOWN",
      ssoSupport: "UNKNOWN",
      auditLogs: "UNKNOWN",
      adminControls: "UNKNOWN",
      complianceClaims: "UNKNOWN",
      deletionSupport: "UNKNOWN",
      termsClarity: "UNKNOWN",
      sensitiveDataHandling: "UNKNOWN",
      businessCriticality: "HIGH",
      userBaseSize: "LARGE",
    })

    assert.equal(result.score, 100)
    assert.equal(result.level, "CRITICAL")
    assert.equal(result.recommendedStatus, "BLOCKED")
    assert.ok(result.topRiskFactors.includes("Regulated data may be used"))
    assert.ok(result.missingInformation.includes("Model training terms"))
  })

  it("maps score bands to risk levels and recommended statuses", () => {
    assert.equal(riskLevelForScore(0), "LOW")
    assert.equal(riskLevelForScore(25), "MEDIUM")
    assert.equal(riskLevelForScore(50), "HIGH")
    assert.equal(riskLevelForScore(75), "CRITICAL")
    assert.equal(recommendedStatusForScore(24), "APPROVED")
    assert.equal(recommendedStatusForScore(25), "RESTRICTED")
    assert.equal(recommendedStatusForScore(50), "UNDER_REVIEW")
    assert.equal(recommendedStatusForScore(75), "BLOCKED")
  })
})
