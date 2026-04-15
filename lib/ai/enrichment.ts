import { Lead } from "@prisma/client";

export interface EnrichmentResult {
  summary: string;
  sellerOutreachNote: string;
  severityClassification: "low" | "medium" | "high";
  rankingReason: string;
}

export interface EnrichmentProvider {
  summarizeLead(lead: Lead): Promise<EnrichmentResult>;
}

export class MockEnrichmentProvider implements EnrichmentProvider {
  async summarizeLead(lead: Lead): Promise<EnrichmentResult> {
    const summary = `${lead.propertyAddress} has ${lead.sourceTypes.length} distress signal(s) with a current lead score of ${lead.leadScore}.`;

    return {
      summary,
      sellerOutreachNote: `Reference the recent ${lead.primarySourceType.toLowerCase().replace("_", " ")} event and ask whether the owner would consider a fast as-is sale.`,
      severityClassification: lead.leadScore >= 75 ? "high" : lead.leadScore >= 45 ? "medium" : "low",
      rankingReason: lead.aiPriorityReason ?? "Mock ranking based on current score and distress overlap."
    };
  }
}

export const enrichmentProvider = new MockEnrichmentProvider();
