# ClearUse AI — Roadmap

> A small-business AI governance tool that lets IT teams maintain an approved AI tool registry, assess vendor risk, and generate acceptable-use guidance.

## Status semantics

| Status | Meaning |
|--------|---------|
| **Approved** | Usable within defined limits |
| **Restricted** | Usable only for certain teams or data types |
| **Under Review** | Not approved yet |
| **Blocked** | Should not be used for company work |

## Incremental build plan

- [x] **Step 1** — Project scaffold, database, seed data, read-only `/tools` table, dashboard stub
- [x] **Step 2** — `/tools/new`, `/tools/[id]` detail, edit form (Server Actions)
- [ ] **Step 3** — Vendor review form on tool detail
- [ ] **Step 4** — Risk scoring rubric and summary on tool page
- [ ] **Step 5** — Employee-facing approved tools page
- [ ] **Step 6** — Supabase Auth + organization/workspace
- [ ] **Step 7** — AI-assisted vendor document extraction (LLM + evidence)
- [ ] **Step 8** — Policy gap auditor
- [ ] **Step 9** — Markdown report exports
- [ ] **Step 10** — RAG/chatbot safety tester (v2)

## Phase overview (from product spec)

### Phase 1 — AI tool registry (current)

Core fields per tool: name, vendor, website, category, status, use cases, allowed data types, review metadata.

### Phase 2 — Risk scoring

Operational rubric (not legal advice): retention, training, SSO, audit logs, admin controls, etc.

### Phase 3 — AI-assisted vendor review

Paste vendor docs → structured extraction with confidence and evidence snippets → human review before save.

### Phase 4 — Policy auditor

Paste policy → completeness checklist → suggested edits (operational guidance, not legal advice).

### Phase 5 — Exportable reports

Markdown exports first; PDF later.

### Phase 6 — Auth and multi-tenant workspaces

Users, organizations, roles (Owner, Admin, Reviewer, Viewer).

### Phase 7 — AI App Safety Tester (v2)

Prompt injection, leakage, hallucination tests for internal chatbots/RAG apps.

## Explicitly deferred

- Billing
- Browser extension
- Full compliance framework
- Automatic vendor website scraping
- Public vendor database
- PDF exports (initially)
