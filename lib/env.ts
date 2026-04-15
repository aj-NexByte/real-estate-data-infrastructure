import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").optional(),
  APP_URL: z.string().url("APP_URL must be a valid URL").optional(),
  INGESTION_API_KEY: z.string().min(1, "INGESTION_API_KEY is required").optional(),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required").optional(),
  DEMO_MODE: z.enum(["true", "false"]).optional()
});

export const serverEnv = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  APP_URL: process.env.APP_URL,
  INGESTION_API_KEY: process.env.INGESTION_API_KEY,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  DEMO_MODE: process.env.DEMO_MODE
});

export function hasDatabaseUrl() {
  return Boolean(serverEnv.DATABASE_URL);
}

export function getDeploymentChecklist() {
  return [
    {
      key: "DATABASE_URL",
      label: "Database connection",
      configured: Boolean(serverEnv.DATABASE_URL),
      detail: "Provision Neon, Supabase, Railway, or Postgres and set DATABASE_URL."
    },
    {
      key: "INGESTION_API_KEY",
      label: "Ingestion API auth",
      configured: Boolean(serverEnv.INGESTION_API_KEY),
      detail: "Protect the scheduled ingestion endpoint with a secret header."
    },
    {
      key: "APP_URL",
      label: "Public app URL",
      configured: Boolean(serverEnv.APP_URL),
      detail: "Set APP_URL to your production domain for absolute links and callbacks."
    },
    {
      key: "NEXTAUTH_SECRET",
      label: "Session secret",
      configured: Boolean(serverEnv.NEXTAUTH_SECRET),
      detail: "Reserve a strong random secret for future auth/session hardening."
    }
  ];
}
