import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hasDatabaseUrl } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const sources = await prisma.countySourceConfig.findMany({
    orderBy: [{ county: "asc" }, { displayName: "asc" }]
  });

  return NextResponse.json(sources);
}
