import { LeadsTable } from "@/components/leads/leads-table";
import { Card } from "@/components/ui/card";
import { exportLeads } from "@/lib/search/leads";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await exportLeads();

  return (
    <main className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">All leads</h1>
            <p className="mt-2 text-sm text-slate-500">Global searchable lead inventory with canonical distress records and CRM-lite status tracking.</p>
          </div>
          <Link href="/api/exports/leads" className="text-sm font-medium text-ocean">
            Export CSV
          </Link>
        </div>
      </Card>
      <LeadsTable leads={leads} />
    </main>
  );
}
