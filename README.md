# ClearUse AI — AI Governance Toolkit

A lightweight AI governance and vendor-risk platform for small IT teams evaluating workplace AI tools.

**Problem:** Employees adopt AI tools faster than small organizations can review them. That creates risk around confidential data, source code, customer information, and unclear vendor policies.

**Phase 1 scope:** Usable AI tool registry with demo data, dashboard counts by status, add/edit/detail workflows, and navigation shell for future modules. No auth, LLM features, risk scoring, or exports yet.

## Features (Phase 1)

- AI tool registry table (`/tools`)
- Add, view, and edit AI tools
- Status badges: Approved, Restricted, Under Review, Blocked
- Allowed data type classification
- Dashboard with tool counts by status
- Demo seed data (ChatGPT, Claude, Cursor, and more)
- Postgres schema shaped for future multi-tenant auth

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Prisma 6 + PostgreSQL (Supabase)
- Vercel-ready deployment

## Local setup

### 1. Clone and install

```bash
npm install
```

### 2. Configure Supabase database

1. Create a [Supabase](https://supabase.com) project.
2. In **Project Settings → Database**, reset/copy the **database password** (not API keys). URL-encode it if it contains special characters.
3. Copy `.env.example` to `.env`. Use the **pooler host** for both URLs (required on most home/office IPv4 networks):

```env
# Transaction pooler — app runtime queries
DATABASE_URL=postgresql://postgres.arualoxtsyynssnnvyeh:YOUR_ENCODED_PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Session pooler — Prisma migrations (NOT db.xxx.supabase.co on IPv4)
DIRECT_URL=postgresql://postgres.arualoxtsyynssnnvyeh:YOUR_ENCODED_PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```

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

No OpenAI or Anthropic API keys are required for Phase 1.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build |
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
docs/             # roadmap.md and future architecture docs
```

## Roadmap

See [docs/roadmap.md](docs/roadmap.md) for the full phased plan.

## Limitations

This tool does **not** provide legal advice. Vendor and policy data must be reviewed by a human. AI-assisted features (later steps) may be incomplete or incorrect.

## License

This repository is source-available for portfolio and evaluation purposes only.

You may view, clone, and run the code locally for personal review. You may not redistribute, sublicense, resell, publish modified versions, or use this code in a commercial product without written permission.

Copyright © 2026 Ryan Kane. All rights reserved.