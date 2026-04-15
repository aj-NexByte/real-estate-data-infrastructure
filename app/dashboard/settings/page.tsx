import Link from "next/link";
import { DeploymentReadiness } from "@/components/dashboard/deployment-readiness";
import { Card } from "@/components/ui/card";
import { listAdapters } from "@/lib/adapters/registry";
import { prisma } from "@/lib/db/prisma";
import { getRuntimeStatus } from "@/lib/runtime";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sourceConfigs = await prisma.countySourceConfig.findMany({
    orderBy: [{ county: "asc" }, { displayName: "asc" }]
  });
  const adapters = listAdapters();
  const runtime = getRuntimeStatus();

  return (
    <main className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-6">
        <DeploymentReadiness checklist={runtime.checklist} />
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900">Launch operations</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>Health endpoint: <Link href="/api/health" className="font-medium text-ocean">/api/health</Link></p>
            <p>Production build command: <code>npm run vercel-build</code></p>
            <p>Production migration command: <code>npm run db:migrate:deploy</code></p>
            <p>Seed command: <code>npm run db:seed</code></p>
          </div>
        </Card>
      </div>
      <Card>
        <h1 className="text-2xl font-semibold text-slate-900">County/source settings</h1>
        <div className="mt-4 space-y-4">
          {sourceConfigs.map((config) => (
            <div key={config.id} className="rounded-2xl border border-slate-100 p-4">
              <p className="font-medium text-slate-900">{config.displayName}</p>
              <p className="text-sm text-slate-500">
                {config.county}, {config.state} · {config.sourceType.replaceAll("_", " ")}
              </p>
              <p className="mt-2 text-sm text-slate-600">Cron: {config.scheduleCron || "manual only"}</p>
              <p className="text-sm text-slate-600">Rate limit: {config.rateLimitPerMinute} requests/min</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-2xl font-semibold text-slate-900">Installed adapters</h2>
        <div className="mt-4 space-y-4">
          {adapters.map((adapter) => (
            <div key={adapter.key} className="rounded-2xl border border-slate-100 p-4">
              <p className="font-medium text-slate-900">{adapter.label}</p>
              <p className="text-sm text-slate-500">Key: {adapter.key}</p>
              <p className="text-sm text-slate-500">Source type: {adapter.sourceType.replaceAll("_", " ")}</p>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
