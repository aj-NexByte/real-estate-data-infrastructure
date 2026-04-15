import { NextResponse } from "next/server";
import { LeadStatus } from "@prisma/client";
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
    query: searchParams.get("query") ?? undefined,
    status: (searchParams.get("status") as LeadStatus | "ALL" | null) ?? undefined
  });

  return NextResponse.json(leads);
}
