# ClearUse AI — AI Governance Toolkit

A lightweight AI governance and vendor-risk platform for small IT teams evaluating workplace AI tools.

**Problem:** Employees adopt AI tools faster than small organizations can review them. That creates risk around confidential data, source code, customer information, and unclear vendor policies.

**Current scope:** A working prototype for AI tool registry, vendor risk review, AI-assisted documentation extraction, policy auditing, report exports, workspace roles, and manual AI app safety testing.

## Features

- AI tool registry table (`/tools`)
- Add, view, and edit AI tools
- Status badges: Approved, Restricted, Under Review, Blocked
- Allowed data type classification
- Vendor review form
- Operational risk scoring with low/medium/high/critical levels
- AI-assisted vendor documentation extraction with evidence snippets
- Policy gap auditor with checklist score and suggested additions
- Markdown and CSV report exports
- Manual AI app safety tester for chatbot/RAG responses
- Employee-facing approved tools guide
- Built-in demo login, workspace creation, memberships, and role permissions
- Dashboard with tool counts by status
- Demo seed data (ChatGPT, Claude, Cursor, and more)
- Postgres schema shaped for future multi-tenant auth

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Prisma 6 + PostgreSQL
- Vercel-ready deployment

## Local setup

### 1. Clone and install

```bash
npm install
```

### 2. Configure the database

For local development, PostgreSQL works well. Create `.env` from
`.env.example` and point `DATABASE_URL` and `DIRECT_URL` at your local database.

This laptop is set up with a local database named `ai_governance_toolkit`.

You can also use Supabase:

1. Create a [Supabase](https://supabase.com) project.
2. In **Project Settings → Database**, reset/copy the **database password** (not API keys). URL-encode it if it contains special characters.
3. Copy `.env.example` to `.env`. Use the **pooler host** for both URLs (required on most home/office IPv4 networks). `DATABASE_URL` is used by the app at runtime, and `DIRECT_URL` is used by Prisma migrations.

Replace `YOUR_ENCODED_PASSWORD` and confirm the project ref / region match your dashboard (**Connect → ORM → Prisma**).

**IPv4 note:** If Supabase shows “Not IPv4 compatible” on the direct host (`db.*.supabase.co:5432`), do **not** use that for `DIRECT_URL`. Use the **Session pooler** URL (port **5432** on `*.pooler.supabase.com`) instead. Direct connections only work on IPv6 unless you buy the IPv4 add-on.

### 3. Migrate and seed

```bash
npm run db:migrate
npm run db:seed
```

For local development with `migrate dev`:

```bash
npm run db:migrate:dev
npm run db:seed
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the dashboard and [http://localhost:3000/tools](http://localhost:3000/tools) for the registry.

`OPENAI_API_KEY` is optional. If it is set, vendor documentation extraction uses the OpenAI Responses API with structured JSON output. If it is not set, the app falls back to a deterministic local extractor so the workflow still runs.

Use [http://localhost:3000/login](http://localhost:3000/login) to create a local demo user session. The settings page lets that user create a new workspace; registry, policy, and report data are scoped to the active workspace.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run verify` | Run lint, tests, and production build |
| `npm run smoke` | Smoke-test a running local app at `http://localhost:3000` |
| `npm run db:migrate` | Apply migrations (production/CI) |
| `npm run db:migrate:dev` | Create/apply migrations in development |
| `npm run db:seed` | Seed demo organization and tools |
| `npm run db:generate` | Regenerate Prisma client |

## Project structure

```text
app/              # Next.js routes (dashboard, tools registry CRUD)
components/       # UI, layout, and tools components
lib/              # Prisma client, constants, helpers
prisma/           # Schema, migrations, seed
sample-data/      # demo-tools.json
docs/             # architecture, roadmap, risk rubric, and threat model
```

## Roadmap

See [docs/roadmap.md](docs/roadmap.md) for the full phased plan.

## Runtime smoke test

After configuring `.env`, migrating, seeding, and starting `npm run dev`, run:

```bash
npm run smoke
```

The smoke test checks `/api/health` plus the dashboard, registry, approved tools, policies, reports, safety tester, and settings pages against the running app.

## Limitations

This tool does **not** provide legal advice. Vendor and policy data must be reviewed by a human. AI-assisted assessments may be incomplete or incorrect and are designed to preserve evidence for reviewer judgment.

## License

This repository is source-available for portfolio and evaluation purposes only.

You may view, clone, and run the code locally for personal review. You may not redistribute, sublicense, resell, publish modified versions, or use this code in a commercial product without written permission.

Copyright © 2026 Ryan Kane. All rights reserved.
