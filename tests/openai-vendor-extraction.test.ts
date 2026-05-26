import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  extractVendorDocumentationWithOpenAI,
  responseTextFromResponsesBody,
} from "@/lib/ai/openai-vendor-extraction"

describe("OpenAI vendor extraction adapter", () => {
  it("reads output_text from a Responses API body", () => {
    assert.equal(
      responseTextFromResponsesBody({ output_text: "{\"ok\":true}" }),
      "{\"ok\":true}"
    )
  })

  it("falls back to nested output content text", () => {
    assert.equal(
      responseTextFromResponsesBody({
        output: [{ content: [{ type: "output_text", text: "{\"ok\":true}" }] }],
      }),
      "{\"ok\":true}"
    )
  })

  it("posts a strict schema request and parses extraction JSON", async () => {
    const fetcher: typeof fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body))

      assert.equal(body.model, "gpt-test")
      assert.equal(body.text.format.type, "json_schema")
      assert.equal(body.text.format.strict, true)

      return new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            modelTraining: {
              status: "NO",
              confidence: "high",
              evidence: "Customer data is not used to train models.",
            },
            dataRetention: {
              status: "UNKNOWN",
              confidence: "low",
              evidence: "No explicit statement found.",
            },
            ssoSupport: {
              status: "YES",
              confidence: "high",
              evidence: "SAML SSO is available.",
            },
            auditLogs: {
              status: "UNKNOWN",
              confidence: "low",
              evidence: "No explicit statement found.",
            },
            adminControls: {
              status: "YES",
              confidence: "medium",
              evidence: "Admins can manage users.",
            },
            complianceClaims: {
              status: "UNKNOWN",
              confidence: "low",
              evidence: "No explicit statement found.",
            },
            deletionSupport: {
              status: "UNKNOWN",
              confidence: "low",
              evidence: "No explicit statement found.",
            },
            termsClarity: {
              status: "YES",
              confidence: "medium",
              evidence: "Privacy policy is published.",
            },
            sensitiveDataHandling: {
              status: "UNKNOWN",
              confidence: "low",
              evidence: "No explicit statement found.",
            },
            riskSummary: "Some fields remain unknown.",
            employeeGuidance: "Restrict until review.",
          }),
        }),
        { status: 200 }
      )
    }

    const result = await extractVendorDocumentationWithOpenAI({
      apiKey: "test-key",
      model: "gpt-test",
      sourceText: "Vendor docs",
      fetcher,
    })

    assert.equal(result.modelTraining.status, "NO")
    assert.equal(result.ssoSupport.status, "YES")
  })
})
