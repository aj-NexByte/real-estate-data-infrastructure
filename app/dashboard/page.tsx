import { DashboardHeader } from "@/components/dashboard/header";
import { DeploymentReadiness } from "@/components/dashboard/deployment-readiness";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SavedFiltersCard } from "@/components/dashboard/saved-filters-card";
import { LeadsTable } from "@/components/leads/leads-table";
import { SourceHealth } from "@/components/sources/source-health";
import { getRuntimeStatus } from "@/lib/runtime";
import { getDashboardSnapshot, LeadFilters } from "@/lib/search/leads";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = normalizeFilters(params);
  const runtime = getRuntimeStatus();
  const data = await getDashboardSnapshot(filters);

  return (
    <main className="space-y-6">
      <DashboardHeader />
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total leads" value={data.metrics.totalLeads} helper="Current filtered lead inventory" />
        <MetricCard label="New leads" value={data.metrics.newLeads} helper="Fresh records waiting for review" />
        <MetricCard label="Average score" value={data.metrics.averageScore} helper="Mean weighted opportunity score" />
        <MetricCard label="High priority" value={data.metrics.highPriority} helper="Score 70+ in current filter set" />
      </section>
      <FilterBar filters={filters} />
      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <LeadsTable leads={data.leads} />
        <div className="space-y-6">
          <DeploymentReadiness checklist={runtime.checklist} />
          <SavedFiltersCard filters={data.savedFilters} />
          <SourceHealth sources={data.sourceHealth} runs={data.recentRuns} />
        </div>
      </section>
    </main>
  );
}

function normalizeFilters(params: Record<string, string | string[] | undefined>): LeadFilters {
  const getValue = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]);

  return {
    county: getValue("county"),
    sourceType: getValue("sourceType"),
    query: getValue("query"),
    minScore: getValue("minScore") ? Number(getValue("minScore")) : undefined,
    maxScore: getValue("maxScore") ? Number(getValue("maxScore")) : undefined,
    startDate: getValue("startDate"),
    endDate: getValue("endDate"),
    occupancy: (getValue("occupancy") as LeadFilters["occupancy"]) ?? "ALL",
    status: (getValue("status") as LeadFilters["status"]) ?? "ALL",
    tag: getValue("tag")
  };
}
