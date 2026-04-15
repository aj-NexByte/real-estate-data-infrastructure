import { CountySourceConfig, IngestionRun } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function SourceHealth({
  sources,
  runs
}: {
  sources: CountySourceConfig[];
  runs: (IngestionRun & { countySourceConfig: CountySourceConfig | null })[];
}) {
  return (
    <Card className="p-0">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">Source health</h2>
        <p className="mt-1 text-sm text-slate-500">Adapter settings, compliance placeholders, and recent ingestion activity.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {sources.map((source) => {
          const latestRun = runs.find((run) => run.sourceKey === source.sourceKey);

          return (
            <div key={source.id} className="grid gap-3 px-6 py-5 md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center">
              <div>
                <p className="font-medium text-slate-900">{source.displayName}</p>
                <p className="text-sm text-slate-500">
                  {source.county}, {source.state} · {source.adapterKey}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={source.enabled ? "success" : "default"}>{source.enabled ? "enabled" : "disabled"}</Badge>
                <Badge tone={source.allowsScraping ? "warning" : "default"}>{source.allowsScraping ? "scraper" : "download/import"}</Badge>
              </div>
              <div className="text-sm text-slate-500">
                <p>Robots: {source.robotsReviewStatus}</p>
                <p>Terms: {source.termsReviewStatus}</p>
              </div>
              <div className="text-sm text-slate-500">
                <p>Status: {latestRun?.status ?? "never run"}</p>
                <p>Fetched: {latestRun?.recordsFetched ?? 0}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
