import { Card } from "@/components/ui/card";

interface ChecklistItem {
  key: string;
  label: string;
  configured: boolean;
  detail: string;
}

export function DeploymentReadiness({ checklist }: { checklist: ChecklistItem[] }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">Deployment readiness</h2>
      <p className="mt-1 text-sm text-slate-500">Production launch checklist for Vercel + Postgres.</p>
      <div className="mt-4 space-y-3">
        {checklist.map((item) => (
          <div key={item.key} className="rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-slate-900">{item.label}</p>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  item.configured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                }`}
              >
                {item.configured ? "configured" : "needs setup"}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
