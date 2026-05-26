# Architecture

ClearUse AI is a Next.js App Router application backed by Prisma and
PostgreSQL. The prototype keeps authentication demo-scoped while preserving an
auth-ready data model for users, organizations, memberships, and roles.

## Main Modules

- Registry: AI tool CRUD, statuses, allowed data types, and use-case guidance.
- Vendor review: Structured control fields and operational risk scoring.
- Vendor extraction: Pasted vendor documentation becomes structured findings
  with confidence and evidence snippets. OpenAI structured output is used when
  `OPENAI_API_KEY` is configured; otherwise the deterministic extractor runs.
- Policy auditor: Pasted policy text becomes a checklist score, missing
  sections, risky language, suggested additions, employee summary, and rewrite
  starter.
- Reports: Markdown exports for vendor reviews, employee guidance, and policy
  gaps, plus a CSV risk register.
- Safety tester: Manual response checks for chatbot/RAG safety risks.

## Data Flow

1. A reviewer creates or edits an AI tool in the registry.
2. The reviewer either fills the vendor review form manually or pastes vendor
   documentation into the extraction workflow.
3. Review controls and allowed data types feed the risk scoring function.
4. Approved and restricted tools appear in the employee guide.
5. Reports export the saved registry, review, and policy state.

## Verification

Core business logic is kept in `lib/` and covered by Node test-runner tests.
Next.js build verifies route type safety and server/client component boundaries.
