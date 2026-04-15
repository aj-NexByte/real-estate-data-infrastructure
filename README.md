# Real Estate AI Data Infrastructure MVP

Production-oriented MVP for ingesting county/public distress records, normalizing them into a canonical lead model, scoring opportunity, and managing outreach workflows from a single dashboard.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- PostgreSQL + Prisma ORM
- Server-side ingestion pipeline with modular source adapters
- CSV/XLSX manual import support
- Cheerio-based HTML parsing with room for Playwright/browser adapters
- Vercel-ready frontend/API deployment with cron-compatible ingestion endpoint

## What is included

- Modular source adapter interface with three example adapters:
  - `csv-tax-lien`
  - `html-code-violation`
  - `manual-upload`
- Canonical lead schema with:
  - lead records
  - source history
  - ingestion runs
  - notes, tasks, contact history
  - saved filters
- Deduplication by APN, normalized address, and owner/address combinations
- Weighted lead scoring engine configurable in code
- Dashboard pages for:
  - overview
  - all leads
  - lead detail
  - imports
  - sources/health
  - settings
- Example API routes for dashboard data, lead data, manual import, CSV export, and scheduled ingestion
- Seed data so the app has immediate demo content

## Project structure

```text
app/
  api/
  dashboard/
  login/
components/
  dashboard/
  leads/
  sources/
  ui/
data/
  sample/
lib/
  adapters/
  ai/
  config/
  csv/
  db/
  ingestion/
  jobs/
  scoring/
  search/
  utils/
prisma/
scripts/
types/
```

## Environment variables

Copy `.env.example` to `.env` and update:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/real_estate_ai"
NEXTAUTH_SECRET="replace-me"
APP_URL="http://localhost:3000"
DEMO_MODE="true"
INGESTION_API_KEY="local-dev-key"
```

Notes:

- `DATABASE_URL` should point to PostgreSQL. Neon, Supabase, Railway, or local Postgres all work.
- `INGESTION_API_KEY` protects the scheduled ingestion endpoint.
- `NEXTAUTH_SECRET` is currently used to sign the lightweight session cookie.
- `APP_URL` should match the deployed app domain in production.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run prisma:generate
```

3. Create or update the database schema:

```bash
npm run prisma:migrate
```

4. Seed demo data:

```bash
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Optional validation:

```bash
npm run check:env
```

6. Sign in with:

- Email: `operator@example.com`
- Password: `demo1234`

## Database schema summary

Key Prisma models:

- `Lead`: canonical lead entity
- `LeadSourceRecord`: preserves multi-source distress signal history
- `CountySourceConfig`: county/source adapter configuration and compliance placeholders
- `IngestionRun`: ingestion health, counts, and error log storage
- `LeadNote`, `LeadTask`, `ContactEvent`: CRM-lite timeline
- `SavedFilter`: reusable lead list queries
- `User`: minimal auth user

See [prisma/schema.prisma](/C:/Users/ajtov/OneDrive/Documents/New%20project/prisma/schema.prisma) for the full schema.

## Ingestion workflow

1. A county/source config selects an adapter by `adapterKey`.
2. The adapter:
   - fetches raw content
   - parses raw records
   - normalizes each record into the canonical lead shape
3. The ingestion pipeline:
   - finalizes normalized values
   - deduplicates against existing leads
   - updates or creates the lead
   - preserves a `LeadSourceRecord`
   - recalculates score/confidence
   - logs an `IngestionRun`

### Example adapters

- `lib/adapters/samples/csv-tax-lien.ts`
- `lib/adapters/samples/html-code-violation.ts`
- `lib/adapters/samples/manual-upload.ts`

### Scheduled ingestion

- API route: `POST /api/jobs/ingest`
- Guarded by header: `x-api-key: <INGESTION_API_KEY>`
- Vercel cron example is configured in [vercel.json](/C:/Users/ajtov/OneDrive/Documents/New%20project/vercel.json)

For local demo runs:

```bash
npm run ingest:demo
```

## Manual import workflow

- Visit `/dashboard/imports`
- Upload `.csv`, `.xlsx`, or `.xls`
- The route converts XLSX to CSV, then passes the content through the `manual-upload` adapter
- Canonical column example is available at:
  - [data/sample/manual-import-template.csv](/C:/Users/ajtov/OneDrive/Documents/New%20project/data/sample/manual-import-template.csv)

## How to add a new county adapter

1. Create a new adapter file in `lib/adapters/samples/` or another adapter folder.
2. Implement the `SourceAdapter` interface from `lib/adapters/base/types.ts`.
3. Add the adapter to `lib/adapters/registry.ts`.
4. Add a `CountySourceConfig` row through seed data, Prisma Studio, or an admin workflow.
5. If the source is scraped:
   - verify robots.txt and site terms
   - add respectful rate limits
   - document any required manual review
6. Add parser fixtures to `data/sample/` for repeatable testing.

### Adapter interface

Each adapter supports:

- `fetchRaw(context)`
- `parseRaw(payload, context)`
- `normalize(record, context)`

This keeps county-specific parsing separate from the canonical ingestion pipeline.

## Lead scoring

Scoring lives in:

- [lib/config/scoring.ts](/C:/Users/ajtov/OneDrive/Documents/New%20project/lib/config/scoring.ts)
- [lib/scoring/score-lead.ts](/C:/Users/ajtov/OneDrive/Documents/New%20project/lib/scoring/score-lead.ts)

Weighted factors include:

- number of distress signals
- filing recency
- absentee owner
- vacancy indicator
- estimated equity
- ownership duration
- tax delinquency severity
- overlap bonuses such as probate + delinquency

## AI enrichment layer

The AI service layer is intentionally provider-agnostic:

- [lib/ai/enrichment.ts](/C:/Users/ajtov/OneDrive/Documents/New%20project/lib/ai/enrichment.ts)

Current implementation is a mock provider with clean interfaces for later use cases:

- explain why a lead matters
- generate outreach notes
- classify severity
- rank priority
- extract structure from messy source records

Do not hardcode API keys. Add provider secrets via environment variables when integrating real models.

## Deployment guide

### Vercel

1. Push this repository to GitHub.
2. Create a Postgres database on Neon, Supabase, Railway, or Vercel Marketplace.
3. In Vercel, import the GitHub repo as a new project.
4. Set these environment variables in Vercel:
   - `DATABASE_URL`
   - `INGESTION_API_KEY`
   - `APP_URL`
   - `NEXTAUTH_SECRET`
5. Set the build command to:

```bash
npm run vercel-build
```

6. Set the install command to:

```bash
npm install
```

7. Deploy the app.
8. Seed production data once against the production database:

```bash
npm run db:seed
```

9. Verify health:
   - open `/api/health`
   - confirm `ok: true`
10. Keep `vercel.json` cron enabled or configure equivalent cron/job infrastructure.

### Database hosting

- Neon: easy serverless Postgres for Vercel
- Supabase: Postgres + extra platform services
- Railway: straightforward hosted Postgres

## Assumptions in this MVP

- Public-record source fixtures are local sample files so the app runs immediately without live scraping credentials.
- Browser automation for dynamic counties can be implemented later with Playwright adapters using the same interface.
- The auth layer is intentionally lightweight for MVP speed; it can be upgraded to NextAuth, Clerk, or magic links later.
- Contact fields are placeholders until a compliant skip-trace/contact enrichment service is selected.

## Production operations

Recommended commands:

```bash
npm run vercel-build
npm run db:migrate:deploy
npm run db:seed
npm run check:env
```

Operational endpoints:

- `GET /api/health`: runtime and database readiness check
- `POST /api/jobs/ingest`: scheduled ingestion entrypoint, protected by `x-api-key`

### First-live checklist

1. Provision production Postgres.
2. Add all required Vercel environment variables.
3. Run tracked migrations with `npm run db:migrate:deploy`.
4. Seed the first operator account with `npm run db:seed`.
5. Open `/api/health` and confirm readiness.
6. Sign in and verify the dashboard loads.
7. Trigger a manual import and a scheduled ingestion test.
8. Attach your custom domain in Vercel.

## Compliance and safety notes

This application is designed for lawful public-record operations only.

- Review local, state, and federal law before collecting, storing, or using property, filing, contact, or occupancy data.
- Review each county website's robots.txt, terms of service, and access policies before scraping.
- Respect rate limits and avoid high-volume or evasive scraping behavior.
- Confirm whether public-record reuse, resale, enrichment, or outreach is restricted in your jurisdiction.
- Verify compliance with privacy, telemarketing, TCPA, CAN-SPAM, state solicitation, and data-broker rules before contacting owners.
- Utility shutoff, vacancy, eviction, probate, and similar distress indicators may be sensitive and subject to additional legal or ethical review.
- Use the `robotsReviewStatus` and `termsReviewStatus` fields in `CountySourceConfig` as explicit review checkpoints before enabling production adapters.

## Example data/config references

- [data/sample/tax-liens.csv](/C:/Users/ajtov/OneDrive/Documents/New%20project/data/sample/tax-liens.csv)
- [data/sample/code-violations.html](/C:/Users/ajtov/OneDrive/Documents/New%20project/data/sample/code-violations.html)
- [data/sample/normalized-leads.json](/C:/Users/ajtov/OneDrive/Documents/New%20project/data/sample/normalized-leads.json)
- [lib/config/source-config-examples.ts](/C:/Users/ajtov/OneDrive/Documents/New%20project/lib/config/source-config-examples.ts)

## Future production upgrades

- role-based auth and audit logs
- source-specific mapping UI for arbitrary county files
- queue-backed ingestion workers with retries/dead-letter handling
- skip trace/contact enrichment integrations
- campaign/outreach automations
- comparables, AVM, and title/mortgage enrichment
- full Playwright browser adapters for JS-heavy counties
