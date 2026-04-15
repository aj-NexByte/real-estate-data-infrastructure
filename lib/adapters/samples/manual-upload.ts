import { LeadStatus, OccupancyType, SourceType } from "@prisma/client";
import { SourceAdapter } from "@/lib/adapters/base/types";
import { parseCsv } from "@/lib/csv/parse";
import { parseBooleanLike, parseCurrency, parseDateValue } from "@/lib/utils/normalization";

export const manualUploadAdapter: SourceAdapter = {
  key: "manual-upload",
  label: "Manual Upload Adapter",
  sourceType: SourceType.MANUAL_IMPORT,
  async fetchRaw() {
    return {
      contentType: "manual",
      body: "",
      metadata: {
        note: "Manual uploads should pass payload directly into the import API route."
      }
    };
  },
  async parseRaw(payload) {
    if (!payload.body) {
      return [];
    }

    return parseCsv<Record<string, string>>(payload.body).map((row, index) => ({
      sourceRecordId: row.record_id ?? `manual-${index + 1}`,
      raw: row
    }));
  },
  async normalize(record) {
    const row = record.raw as Record<string, string>;
    const absentee = parseBooleanLike(row.absentee_owner);

    return {
      propertyAddress: row.property_address,
      city: row.city,
      state: row.state ?? "AZ",
      zipCode: row.zip_code,
      county: row.county,
      parcelNumber: row.parcel_number,
      ownerName: row.owner_name,
      mailingAddress: row.mailing_address,
      sourceType: SourceType.MANUAL_IMPORT,
      sourceUrl: row.source_url ?? null,
      filingDate: parseDateValue(row.filing_date),
      noticeDate: parseDateValue(row.notice_date),
      status: LeadStatus.NEW,
      assessedValue: parseCurrency(row.assessed_value),
      estimatedMarketValue: parseCurrency(row.market_value),
      estimatedEquity: parseCurrency(row.estimated_equity),
      taxDelinquencyAmount: parseCurrency(row.tax_delinquency_amount),
      occupancyType:
        absentee === true ? OccupancyType.ABSENTEE : absentee === false ? OccupancyType.OWNER_OCCUPIED : OccupancyType.UNKNOWN,
      vacantIndicator: parseBooleanLike(row.vacant) ?? false,
      distressTags: ["manual_import"],
      notes: row.notes ?? null,
      rawReference: row.record_id ?? null,
      rawPayload: row,
      confidenceScore: 58
    };
  }
};
