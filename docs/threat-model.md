# Threat Model

ClearUse AI stores internal AI governance decisions, vendor review notes, pasted
vendor documentation, policy drafts, and chatbot/RAG safety-test responses. It
should be treated as an internal operations application.

## Primary Risks

- Unauthorized users viewing or changing approved AI tool guidance.
- Sensitive information pasted into vendor notes, policy drafts, or safety-test
  responses.
- AI-generated extraction or policy audit output being treated as authoritative.
- Cross-organization data access once real multi-tenant auth is connected.
- Report exports being shared outside intended audiences.

## Current Mitigations

- Organization, membership, and role models are in place before real auth wiring.
- Employee-facing guidance only exposes approved and restricted tools.
- Vendor extraction preserves evidence snippets and keeps unknowns explicit.
- Risk and policy modules include legal/operational limitations in user-facing
  copy and docs.
- Safety tester treats pasted chatbot responses as manually supplied artifacts
  and does not call external endpoints.

## Future Hardening

- Replace demo session behavior with Supabase Auth session validation.
- Enforce role checks in all server actions before mutation.
- Add audit logs for review, policy, and report export actions.
- Add redaction for secrets in pasted documentation and safety-test responses.
- Add per-organization storage boundaries and automated authorization tests.
