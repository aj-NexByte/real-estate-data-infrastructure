import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/env";
import { getLeadById } from "@/lib/search/leads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json(lead);
}
