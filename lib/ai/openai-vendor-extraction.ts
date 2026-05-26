import type { VendorExtractionResult } from "@/lib/ai/vendor-extraction"

type ResponsesContent = {
  type?: string
  text?: string
}

type ResponsesOutput = {
  content?: ResponsesContent[]
}

type ResponsesBody = {
  output_text?: string
  output?: ResponsesOutput[]
}

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "modelTraining",
    "dataRetention",
    "ssoSupport",
    "auditLogs",
    "adminControls",
    "complianceClaims",
    "deletionSupport",
    "termsClarity",
    "sensitiveDataHandling",
    "riskSummary",
    "employeeGuidance",
  ],
  properties: {
    modelTraining: { $ref: "#/$defs/finding" },
    dataRetention: { $ref: "#/$defs/finding" },
    ssoSupport: { $ref: "#/$defs/finding" },
    auditLogs: { $ref: "#/$defs/finding" },
    adminControls: { $ref: "#/$defs/finding" },
    complianceClaims: { $ref: "#/$defs/finding" },
    deletionSupport: { $ref: "#/$defs/finding" },
    termsClarity: { $ref: "#/$defs/finding" },
    sensitiveDataHandling: { $ref: "#/$defs/finding" },
    riskSummary: { type: "string" },
    employeeGuidance: { type: "string" },
  },
  $defs: {
    finding: {
      type: "object",
      additionalProperties: false,
      required: ["status", "confidence", "evidence"],
      properties: {
        status: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
        evidence: { type: "string" },
      },
    },
  },
}

export function responseTextFromResponsesBody(body: ResponsesBody) {
  if (body.output_text) {
    return body.output_text
  }

  return (
    body.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .find((text): text is string => Boolean(text)) ?? ""
  )
}

export async function extractVendorDocumentationWithOpenAI({
  apiKey,
  model = process.env.OPENAI_MODEL ?? "gpt-4.1",
  sourceText,
  fetcher = fetch,
}: {
  apiKey: string
  model?: string
  sourceText: string
  fetcher?: typeof fetch
}): Promise<VendorExtractionResult> {
  const response = await fetcher("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "Extract AI vendor review fields from provided documentation. Use UNKNOWN when the text does not explicitly answer a field. Every non-UNKNOWN answer must include a short supporting evidence snippet from the source text.",
        },
        {
          role: "user",
          content: sourceText,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "vendor_review_extraction",
          schema: extractionSchema,
          strict: true,
        },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI extraction failed with status ${response.status}`)
  }

  const body = (await response.json()) as ResponsesBody
  const text = responseTextFromResponsesBody(body)

  if (!text) {
    throw new Error("OpenAI extraction returned no text output")
  }

  return JSON.parse(text) as VendorExtractionResult
}
