import { hasDatabaseUrl, getDeploymentChecklist } from "@/lib/env";

export function getRuntimeStatus() {
  const checklist = getDeploymentChecklist();
  const missing = checklist.filter((item) => !item.configured);

  return {
    hasDatabaseUrl: hasDatabaseUrl(),
    readyForRuntime: missing.length === 0,
    checklist,
    missing
  };
}
