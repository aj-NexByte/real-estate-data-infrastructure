import { NextResponse } from "next/server";
import { getDatabaseHealth } from "@/lib/db/health";
import { getRuntimeStatus } from "@/lib/runtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const runtime = getRuntimeStatus();
  const database = await getDatabaseHealth();

  return NextResponse.json({
    ok: runtime.readyForRuntime && database.ok,
    timestamp: new Date().toISOString(),
    runtime,
    database
  });
}
