import { LeadStatus, OccupancyType, SourceType } from "@prisma/client";

export type DistressTag =
  | "tax_lien"
  | "foreclosure"
  | "probate"
  | "code_violation"
  | "eviction"
  | "delinquent_tax"
  | "sheriff_sale"
  | "vacant"
  | "deed_transfer"
  | "lis_pendens"
  | "utility_shutoff"
  | "manual_import"
  | "absentee_owner"
  | "equity_rich";

export interface CanonicalLeadRecord {
  propertyAddress: string;
  city?: string | null;
  state: string;
  zipCode?: string | null;
  county: string;
  parcelNumber?: string | null;
  ownerName?: string | null;
  mailingAddress?: string | null;
  sourceType: SourceType;
  sourceUrl?: string | null;
  filingDate?: Date | null;
  noticeDate?: Date | null;
  status?: LeadStatus;
  assessedValue?: number | null;
  estimatedMarketValue?: number | null;
  estimatedEquity?: number | null;
  ownershipLengthMonths?: number | null;
  taxDelinquencyAmount?: number | null;
  occupancyType?: OccupancyType;
  vacantIndicator?: boolean;
  distressTags: DistressTag[];
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  rawReference?: string | null;
  rawPayload?: Record<string, unknown> | null;
  confidenceScore?: number;
}

export interface AdapterContext {
  runId?: string;
  sourceKey: string;
  sourceName: string;
  county: string;
  state: string;
  rateLimitPerMinute: number;
  dryRun?: boolean;
}

export interface FetchedPayload {
  contentType: "csv" | "html" | "json" | "manual";
  body: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ParsedSourceRecord {
  sourceRecordId?: string;
  raw: Record<string, unknown>;
}

export interface DeduplicationResult {
  leadId?: string;
  matchedBy?: "parcel" | "address_owner" | "address" | "none";
}

export interface LeadScoreBreakdown {
  score: number;
  confidence: number;
  factors: Array<{
    label: string;
    points: number;
    reason: string;
  }>;
}
