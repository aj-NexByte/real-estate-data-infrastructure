import { runScheduledIngestion } from "@/lib/jobs/ingest";

runScheduledIngestion()
  .then((runs) => {
    console.log(`Completed ${runs.length} ingestion run(s).`);
  })
  .catch((error) => {
    console.error("Demo ingestion failed:", error);
    process.exit(1);
  });
