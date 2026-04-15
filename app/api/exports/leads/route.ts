import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/env";
import { exportLeads } from "@/lib/search/leads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const leads = await exportLeads({
    county: searchParams.get("county") ?? undefined,
    sourceType: searchParams.get("sourceType") ?? undefined,
    query: searchParams.get("query") ?? undefined
  });

  const header = [
    "id",
    "propertyAddress",
    "parcelNumber",
    "ownerName",
    "county",
    "state",
    "status",
    "leadScore",
    "confidenceScore"
  ];

  const rows = leads.map((lead) =>
    [
      lead.id,
      lead.propertyAddress,
      lead.parcelNumber ?? "",
      lead.ownerName ?? "",
      lead.county,
      lead.state,
      lead.status,
      lead.leadScore,
      lead.confidenceScore
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="distressed-leads.csv"'
    }
  });
}
