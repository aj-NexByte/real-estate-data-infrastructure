import { getDeploymentChecklist } from "@/lib/env";

const checklist = getDeploymentChecklist();
const missing = checklist.filter((item) => !item.configured);

if (missing.length === 0) {
  console.log("Environment looks ready for production runtime.");
  process.exit(0);
}

console.error("Missing required deployment variables:");
for (const item of missing) {
  console.error(`- ${item.key}: ${item.detail}`);
}

process.exit(1);
