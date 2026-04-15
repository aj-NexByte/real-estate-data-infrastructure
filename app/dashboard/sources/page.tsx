import { SourceHealth } from "@/components/sources/source-health";
import { Card } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/lib/search/leads";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const data = await getDashboardSnapshot();

  return (
    <main className="space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold text-slate-900">Sources and ingestion health</h1>
        <p className="mt-2 text-sm text-slate-500">County adapter inventory, compliance review placeholders, and recent ingestion logs.</p>
      </Card>
      <SourceHealth sources={data.sourceHealth} runs={data.recentRuns} />
    </main>
  );
}
