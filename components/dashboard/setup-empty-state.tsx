import { Card } from "@/components/ui/card";

export function SetupEmptyState() {
  return (
    <Card className="border-amber-200 bg-amber-50/70">
      <h1 className="text-2xl font-semibold text-slate-900">Database setup still needed</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
        The app is deployed-ready, but it needs a live PostgreSQL connection before lead data, auth, imports, and ingestion can operate.
        Set <code>DATABASE_URL</code>, run migrations, and seed your first operator account.
      </p>
      <div className="mt-4 space-y-2 text-sm text-slate-700">
        <p>1. Provision Postgres in Neon, Supabase, Railway, or another provider.</p>
        <p>2. Add `DATABASE_URL`, `INGESTION_API_KEY`, `APP_URL`, and `NEXTAUTH_SECRET` in Vercel.</p>
        <p>3. Run `npm run db:migrate:deploy` and `npm run db:seed` against production.</p>
        <p>4. Redeploy and sign in with your seeded operator user.</p>
      </div>
    </Card>
  );
}
