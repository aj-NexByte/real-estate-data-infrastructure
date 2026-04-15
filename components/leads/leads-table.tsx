import Link from "next/link";
import { Lead } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Lead</th>
              <th className="px-5 py-4">County</th>
              <th className="px-5 py-4">Signals</th>
              <th className="px-5 py-4">Score</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                  No leads match the current filters.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="align-top">
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/leads/${lead.id}`} className="font-medium text-slate-900 hover:text-ocean">
                      {lead.propertyAddress}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{lead.ownerName || "Unknown owner"}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {lead.county}, {lead.state}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {lead.distressTags.slice(0, 3).map((tag) => (
                        <Badge key={tag} tone="warning">
                          {tag.replaceAll("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{lead.leadScore}</div>
                    <div className="text-xs text-slate-500">confidence {lead.confidenceScore}%</div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={lead.status === "NEW" ? "info" : lead.status === "DEAD" ? "danger" : "success"}>
                      {lead.status.replaceAll("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{lead.updatedAt.toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
