import { LeadStatus, OccupancyType, SourceType } from "@prisma/client";
import { load } from "cheerio";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SourceAdapter } from "@/lib/adapters/base/types";
import { parseCurrency, parseDateValue } from "@/lib/utils/normalization";

export const htmlCodeViolationAdapter: SourceAdapter = {
  key: "html-code-violation",
  label: "HTML Code Violation Scraper",
  sourceType: SourceType.CODE_VIOLATION,
  async fetchRaw() {
    const filePath = join(process.cwd(), "data", "sample", "code-violations.html");
    const body = await readFile(filePath, "utf8");

    return {
      contentType: "html",
      body,
      sourceUrl: "https://example.gov/duval/code-violations"
    };
  },
  async parseRaw(payload) {
    const $ = load(payload.body);
    const rows = $("table tbody tr").toArray();

    return rows.map((row, index) => {
      const cells = $(row).find("td");

      return {
        sourceRecordId: $(cells[0]).text().trim() || `html-${index}`,
        raw: {
          caseNumber: $(cells[0]).text().trim(),
          propertyAddress: $(cells[1]).text().trim(),
          ownerName: $(cells[2]).text().trim(),
          county: $(cells[3]).text().trim(),
          filingDate: $(cells[4]).text().trim(),
          status: $(cells[5]).text().trim(),
          assessedValue: $(cells[6]).text().trim(),
          probateFlag: $(cells[7]).text().trim()
        }
      };
    });
  },
  async normalize(record) {
    const row = record.raw as Record<string, string>;
    const hasProbate = row.probateFlag?.toLowerCase() === "yes";

    return {
      propertyAddress: row.propertyAddress,
      county: row.county,
      city: "Jacksonville",
      state: "FL",
      ownerName: row.ownerName,
      sourceType: SourceType.CODE_VIOLATION,
      sourceUrl: "https://example.gov/duval/code-violations",
      filingDate: parseDateValue(row.filingDate),
      noticeDate: parseDateValue(row.filingDate),
      status: LeadStatus.NEW,
      assessedValue: parseCurrency(row.assessedValue),
      occupancyType: OccupancyType.UNKNOWN,
      vacantIndicator: false,
      distressTags: hasProbate ? ["code_violation", "probate"] : ["code_violation"],
      notes: `Violation status: ${row.status}`,
      rawReference: row.caseNumber,
      rawPayload: row,
      confidenceScore: hasProbate ? 74 : 63
    };
  }
};
