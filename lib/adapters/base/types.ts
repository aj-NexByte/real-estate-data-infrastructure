import { SourceType } from "@prisma/client";
import { AdapterContext, CanonicalLeadRecord, FetchedPayload, ParsedSourceRecord } from "@/types/domain";

export interface SourceAdapter {
  key: string;
  label: string;
  sourceType: SourceType;
  // Fetches the raw source payload. Adapters can read files, request CSV downloads,
  // or drive browser automation for counties that require interactive access.
  fetchRaw(context: AdapterContext): Promise<FetchedPayload>;
  parseRaw(payload: FetchedPayload, context: AdapterContext): Promise<ParsedSourceRecord[]>;
  // Converts county-specific rows into the canonical lead shape consumed by the pipeline.
  normalize(record: ParsedSourceRecord, context: AdapterContext): Promise<CanonicalLeadRecord | null>;
}
