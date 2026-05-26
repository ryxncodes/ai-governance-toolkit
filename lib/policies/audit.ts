export type PolicyChecklistItem = {
  id: string
  label: string
  matched: boolean
  suggestion: string
}

export type PolicyAuditResult = {
  score: number
  checklist: PolicyChecklistItem[]
  missingSections: string[]
  riskyLanguage: string[]
  suggestedAdditions: string[]
  employeeSummary: string
  formalRewrite: string
}

const checklistDefinitions = [
  {
    id: "approved-tools",
    label: "Approved tools",
    patterns: [/approved\s+(?:ai\s+)?tools?/i, /authorized\s+(?:ai\s+)?tools?/i],
    suggestion: "List the AI tools employees may use for company work.",
  },
  {
    id: "prohibited-tools",
    label: "Prohibited tools",
    patterns: [/prohibited\s+(?:ai\s+)?tools?/i, /blocked\s+(?:ai\s+)?tools?/i],
    suggestion: "Define which tools or tool categories are not allowed.",
  },
  {
    id: "data-classification",
    label: "Data classification rules",
    patterns: [/data\s+classification/i, /public\s+data/i, /confidential\s+data/i],
    suggestion: "Map AI use to data classes such as public, internal, confidential, customer, source code, credentials, and regulated data.",
  },
  {
    id: "customer-data",
    label: "Customer data",
    patterns: [/customer\s+data/i, /client\s+data/i],
    suggestion: "State when customer or client data may be used with AI tools.",
  },
  {
    id: "source-code",
    label: "Source code",
    patterns: [/source\s+code/i, /code\s+repository/i],
    suggestion: "Define whether source code may be submitted to AI tools.",
  },
  {
    id: "credentials",
    label: "Credentials/secrets",
    patterns: [/credentials?/i, /secrets?/i, /api\s+keys?/i, /passwords?/i],
    suggestion: "Explicitly prohibit credentials, secrets, passwords, and API keys.",
  },
  {
    id: "regulated-data",
    label: "Regulated data",
    patterns: [/regulated\s+data/i, /student\s+data/i, /patient\s+data/i, /phi\b/i, /pii\b/i],
    suggestion: "Address regulated, student, patient, personal, or sensitive data.",
  },
  {
    id: "output-review",
    label: "AI-generated output review",
    patterns: [/review\s+(?:ai-)?generated/i, /verify\s+(?:ai\s+)?output/i, /human\s+review/i],
    suggestion: "Require employees to review AI-generated output before use.",
  },
  {
    id: "employee-responsibility",
    label: "Employee responsibility",
    patterns: [/employees?\s+(?:are\s+)?responsible/i, /user\s+responsibility/i],
    suggestion: "Clarify that employees remain responsible for AI-assisted work.",
  },
  {
    id: "vendor-review",
    label: "Vendor review process",
    patterns: [/vendor\s+review/i, /security\s+review/i, /privacy\s+review/i],
    suggestion: "Describe how new AI vendors are reviewed before approval.",
  },
  {
    id: "incident-reporting",
    label: "Incident reporting",
    patterns: [/incident\s+report/i, /report\s+(?:an\s+)?incident/i],
    suggestion: "Tell employees how to report accidental disclosure or unsafe AI output.",
  },
  {
    id: "browser-extensions",
    label: "Browser extensions",
    patterns: [/browser\s+extensions?/i],
    suggestion: "Cover AI browser extensions and plugins.",
  },
  {
    id: "meeting-transcription",
    label: "Meeting transcription tools",
    patterns: [/meeting\s+transcription/i, /transcription\s+tools?/i, /recorded\s+meetings?/i],
    suggestion: "Set rules for AI note takers, recording, and transcription tools.",
  },
  {
    id: "hr-legal-finance",
    label: "HR/legal/finance decisions",
    patterns: [/HR/i, /legal/i, /finance/i, /employment\s+decisions?/i],
    suggestion: "Restrict AI use for HR, legal, finance, or other high-impact decisions.",
  },
  {
    id: "review-cadence",
    label: "Review cadence",
    patterns: [/review\s+cadence/i, /reviewed\s+(?:annually|quarterly)/i, /annual\s+review/i],
    suggestion: "Set a recurring review cadence for tools and policy updates.",
  },
]

const riskyLanguagePatterns = [
  {
    pattern: /employees?\s+may\s+use\s+any\s+ai\s+tool/i,
    message: "Policy appears to allow any AI tool without review.",
  },
  {
    pattern: /no\s+restrictions?/i,
    message: "Policy uses broad no-restriction language.",
  },
  {
    pattern: /confidential\s+data\s+may\s+be\s+entered/i,
    message: "Policy may allow confidential data without limits.",
  },
]

export function auditPolicy(content: string): PolicyAuditResult {
  const checklist = checklistDefinitions.map((item) => ({
    id: item.id,
    label: item.label,
    matched: item.patterns.some((pattern) => pattern.test(content)),
    suggestion: item.suggestion,
  }))

  const missingSections = checklist
    .filter((item) => !item.matched)
    .map((item) => item.label)

  const riskyLanguage = riskyLanguagePatterns
    .filter((item) => item.pattern.test(content))
    .map((item) => item.message)

  const score = Math.max(
    0,
    Math.round(
      (checklist.filter((item) => item.matched).length / checklist.length) * 100
    ) - riskyLanguage.length * 15
  )

  const suggestedAdditions = checklist
    .filter((item) => !item.matched)
    .slice(0, 6)
    .map((item) => item.suggestion)

  const employeeSummary =
    "Use only approved AI tools, follow data classification limits, never submit secrets or regulated data unless explicitly approved, and review AI output before relying on it."

  const formalRewrite = [
    "Employees may use only AI tools approved by the organization for company work.",
    "Employees must follow the approved data-type limits for each tool and must not submit credentials, secrets, regulated data, or customer data unless explicitly approved.",
    "AI-generated output must be reviewed by a human before use in business decisions, customer communications, source code, legal, HR, finance, or security workflows.",
    "New AI tools must complete vendor review before use, and incidents or accidental disclosure must be reported promptly.",
  ].join("\n\n")

  return {
    score,
    checklist,
    missingSections,
    riskyLanguage,
    suggestedAdditions,
    employeeSummary,
    formalRewrite,
  }
}
