import { ContactEvent, CountySourceConfig, Lead, LeadNote, LeadSourceRecord, LeadTask } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type LeadDetailData = Lead & {
  sources: Array<LeadSourceRecord & { countySourceConfig: CountySourceConfig | null }>;
  notesTimeline: LeadNote[];
  contactHistory: ContactEvent[];
  tasks: LeadTask[];
};

export function LeadDetail({ lead }: { lead: LeadDetailData }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              {lead.county}, {lead.state}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{lead.propertyAddress}</h1>
            <p className="mt-2 text-slate-600">{lead.ownerName || "Unknown owner"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Lead score</p>
            <p className="text-4xl font-semibold text-slate-900">{lead.leadScore}</p>
            <p className="text-sm text-slate-500">confidence {lead.confidenceScore}%</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {lead.distressTags.map((tag) => (
            <Badge key={tag} tone="warning">
              {tag.replaceAll("_", " ")}
            </Badge>
          ))}
        </div>
        <dl className="mt-8 grid gap-4 md:grid-cols-2">
          <DetailItem label="Parcel / APN" value={lead.parcelNumber || "N/A"} />
          <DetailItem label="Mailing address" value={lead.mailingAddress || "N/A"} />
          <DetailItem label="Assessed value" value={formatMoney(lead.assessedValue)} />
          <DetailItem label="Estimated equity" value={formatMoney(lead.estimatedEquity)} />
          <DetailItem label="Occupancy" value={lead.occupancyType.replaceAll("_", " ")} />
          <DetailItem label="Workflow status" value={lead.status.replaceAll("_", " ")} />
        </dl>
        <div className="mt-8 rounded-3xl bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900">AI lead summary</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{lead.aiSummary || "No AI summary saved yet."}</p>
          <p className="mt-3 text-sm font-medium text-slate-700">{lead.aiPriorityReason || "Priority explanation pending."}</p>
        </div>
      </Card>
      <div className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Source history</h2>
          <div className="mt-4 space-y-4">
            {lead.sources.map((source) => (
              <div key={source.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{source.sourceType.replaceAll("_", " ")}</p>
                  <Badge tone="info">{source.countySourceConfig?.displayName ?? "Detached source"}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">Hash: {source.normalizedHash}</p>
                <p className="text-sm text-slate-500">Filed: {source.filingDate?.toLocaleDateString() ?? "N/A"}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Notes timeline</h2>
          <div className="mt-4 space-y-3">
            {lead.notesTimeline.length === 0 ? (
              <p className="text-sm text-slate-500">No notes yet.</p>
            ) : (
              lead.notesTimeline.map((note) => (
                <div key={note.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-700">{note.body}</p>
                  <p className="mt-2 text-xs text-slate-500">{note.createdAt.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Contact history</h2>
          <div className="mt-4 space-y-3">
            {lead.contactHistory.length === 0 ? (
              <p className="text-sm text-slate-500">No contact events yet.</p>
            ) : (
              lead.contactHistory.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{item.channel}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
          <div className="mt-4 space-y-3">
            {lead.tasks.length === 0 ? (
              <p className="text-sm text-slate-500">No follow-up tasks yet.</p>
            ) : (
              lead.tasks.map((task) => (
                <div key={task.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <Badge tone={task.status === "DONE" ? "success" : "warning"}>{task.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Due: {task.dueAt?.toLocaleDateString() ?? "No due date"}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function formatMoney(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string" && typeof value !== "bigint") {
    return "N/A";
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(numeric);
}
