import Papa from "papaparse";
import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/env";
import { ingestSource } from "@/lib/ingestion/pipeline";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing upload file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const lowerName = file.name.toLowerCase();
  let csvBody = "";

  if (lowerName.endsWith(".csv")) {
    csvBody = buffer.toString("utf8");
  } else if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    csvBody = Papa.unparse(XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]));
  } else {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (buffer.byteLength > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Keep uploads under 10MB for MVP." }, { status: 413 });
  }

  const run = await ingestSource({
    sourceKey: "manual-upload-distress",
    csvBodyOverride: csvBody
  });

  return NextResponse.json({
    message: `Manual import completed. ${run.leadsCreated} created, ${run.leadsUpdated} updated.`,
    run
  });
}
