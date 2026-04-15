import { prisma } from "@/lib/db/prisma";
import { hasDatabaseUrl } from "@/lib/env";

export async function getDatabaseHealth() {
  if (!hasDatabaseUrl()) {
    return {
      ok: false,
      reason: "DATABASE_URL is not configured"
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      ok: true
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Unknown database error"
    };
  }
}
