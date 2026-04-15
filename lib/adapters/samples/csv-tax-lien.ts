import { LeadStatus, OccupancyType, SourceType } from "@prisma/client";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SourceAdapter } from "@/lib/adapters/base/types";
import { parseCsv } from "@/lib/csv/parse";
import { parseBooleanLike, parseCurrency, parseDateValue } from "@/lib/utils/normalization";

type TaxLienRow = {
  record_id: string;
  property_address: string;
  city: string;
  state: string;
  zip_code: string;
  county: string;
  parcel_number: string;
  owner_name: string;
  mailing_address: string;
  filing_date: string;
  notice_date: string;
  assessed_value: string;
  market_value: string;
  estimated_equity: string;
  tax_delinquency_amount: string;
  absentee_owner: string;
  vacant: string;
};

export const csvTaxLienAdapter: SourceAdapter = {
  key: "csv-tax-lien",
  label: "CSV Tax Lien Importer",
  sourceType: SourceType.TAX_LIEN,
  async fetchRaw() {
    const filePath = join(process.cwd(), "data", "sample", "tax-liens.csv");
    const body = await readFile(filePath, "utf8");

    return {
      contentType: "csv",
      body,
      sourceUrl: "file://data/sample/tax-liens.csv"
    };
  },
  async parseRaw(payload) {
    return parseCsv<TaxLienRow>(payload.body).map((row) => ({
      sourceRecordId: row.record_id,
      raw: row
    }));
  },
  async normalize(record) {
    const row = record.raw as TaxLienRow;
    const absentee = parseBooleanLike(row.absentee_owner);
    const vacant = parseBooleanLike(row.vacant) ?? false;

    return {
      propertyAddress: row.property_address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      county: row.county,
      parcelNumber: row.parcel_number,
      ownerName: row.owner_name,
      mailingAddress: row.mailing_address,
      sourceType: SourceType.TAX_LIEN,
      sourceUrl: "https://example.gov/cook/tax-liens.csv",
      filingDate: parseDateValue(row.filing_date),
      noticeDate: parseDateValue(row.notice_date),
      status: LeadStatus.NEW,
      assessedValue: parseCurrency(row.assessed_value),
      estimatedMarketValue: parseCurrency(row.market_value),
      estimatedEquity: parseCurrency(row.estimated_equity),
      taxDelinquencyAmount: parseCurrency(row.tax_delinquency_amount),
      occupancyType:
        absentee === true ? OccupancyType.ABSENTEE : absentee === false ? OccupancyType.OWNER_OCCUPIED : OccupancyType.UNKNOWN,
      vacantIndicator: vacant,
      distressTags: vacant ? ["tax_lien", "vacant"] : ["tax_lien"],
      rawReference: row.record_id,
      rawPayload: row,
      confidenceScore: 76
    };
  }
};
