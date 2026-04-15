import { prisma } from "@/lib/db/prisma";
import { ingestSource } from "@/lib/ingestion/pipeline";

export async function runScheduledIngestion() {
  const enabledSources = await prisma.countySourceConfig.findMany({
    where: { enabled: true },
    orderBy: { county: "asc" }
  });

  const results = [];
  for (const source of enabledSources) {
    const result = await ingestSource({ sourceKey: source.sourceKey });
    results.push(result);
  }

  return results;
}
