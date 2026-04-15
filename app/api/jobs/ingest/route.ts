import { NextResponse } from "next/server";
import { hasDatabaseUrl, serverEnv } from "@/lib/env";
import { runScheduledIngestion } from "@/lib/jobs/ingest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  if (!serverEnv.INGESTION_API_KEY) {
    return NextResponse.json({ error: "INGESTION_API_KEY is not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("x-api-key");

  if (authHeader !== serverEnv.INGESTION_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const runs = await runScheduledIngestion();
  return NextResponse.json({
    message: `Executed ${runs.length} ingestion run(s).`,
    runs
  });
}
