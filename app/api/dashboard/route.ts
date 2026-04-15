import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/env";
import { getDashboardSnapshot } from "@/lib/search/leads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);

  const data = await getDashboardSnapshot({
    county: searchParams.get("county") ?? undefined,
    sourceType: searchParams.get("sourceType") ?? undefined,
    query: searchParams.get("query") ?? undefined,
    minScore: searchParams.get("minScore") ? Number(searchParams.get("minScore")) : undefined
  });

  return NextResponse.json(data);
}
