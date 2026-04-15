import { OccupancyType, SourceType } from "@prisma/client";
import { differenceInDays } from "date-fns";
import { scoringConfig } from "@/lib/config/scoring";
import { DistressTag, LeadScoreBreakdown } from "@/types/domain";

interface ScoreLeadInput {
  sourceTypes: SourceType[];
  distressTags: DistressTag[];
  filingDate?: Date | null;
  estimatedEquity?: number | null;
  occupancyType?: OccupancyType | null;
  vacantIndicator?: boolean | null;
  ownershipLengthMonths?: number | null;
  taxDelinquencyAmount?: number | null;
}

export function scoreLead(input: ScoreLeadInput): LeadScoreBreakdown {
  const factors: LeadScoreBreakdown["factors"] = [];
  let score = Math.min(input.sourceTypes.length * scoringConfig.distressSignalWeight, 24);
  factors.push({
    label: "Distress signals",
    points: score,
    reason: `${input.sourceTypes.length} source signal(s) recorded`
  });

  const filingDate = input.filingDate ?? null;
  if (filingDate) {
    const daysOld = Math.abs(differenceInDays(new Date(), filingDate));
    const points =
      daysOld <= 30
        ? scoringConfig.recency.within30Days
        : daysOld <= 90
          ? scoringConfig.recency.within90Days
          : scoringConfig.recency.older;

    score += points;
    factors.push({
      label: "Recency",
      points,
      reason: `${daysOld} day(s) since filing`
    });
  }

  if (input.occupancyType === OccupancyType.ABSENTEE) {
    score += scoringConfig.absenteeOwner;
    factors.push({
      label: "Absentee owner",
      points: scoringConfig.absenteeOwner,
      reason: "Mailing address suggests owner does not occupy the property"
    });
  }

  if (input.vacantIndicator) {
    score += scoringConfig.vacantIndicator;
    factors.push({
      label: "Vacancy signal",
      points: scoringConfig.vacantIndicator,
      reason: "Vacancy or abandonment indicator present"
    });
  }

  if (typeof input.estimatedEquity === "number") {
    const points =
      input.estimatedEquity >= 150000
        ? scoringConfig.equity.high
        : input.estimatedEquity >= 50000
          ? scoringConfig.equity.medium
          : scoringConfig.equity.low;

    score += points;
    factors.push({
      label: "Estimated equity",
      points,
      reason: `Estimated equity ${Math.round(input.estimatedEquity).toLocaleString()}`
    });
  }

  if ((input.ownershipLengthMonths ?? 0) >= 120) {
    score += scoringConfig.longOwnership;
    factors.push({
      label: "Ownership duration",
      points: scoringConfig.longOwnership,
      reason: "Long ownership duration can indicate motivation and equity"
    });
  }

  if ((input.taxDelinquencyAmount ?? 0) >= 5000) {
    score += scoringConfig.severeTaxDelinquency;
    factors.push({
      label: "Tax severity",
      points: scoringConfig.severeTaxDelinquency,
      reason: "Meaningful delinquent tax balance"
    });
  }

  if (input.distressTags.includes("probate") && input.distressTags.includes("delinquent_tax")) {
    score += scoringConfig.overlapBonus.probateAndDelinquency;
    factors.push({
      label: "Probate overlap",
      points: scoringConfig.overlapBonus.probateAndDelinquency,
      reason: "Probate plus delinquent tax can signal accelerated motivation"
    });
  }

  if (input.sourceTypes.includes(SourceType.FORECLOSURE) && input.vacantIndicator) {
    score += scoringConfig.overlapBonus.foreclosureAndVacant;
    factors.push({
      label: "Foreclosure + vacancy",
      points: scoringConfig.overlapBonus.foreclosureAndVacant,
      reason: "Vacant foreclosure leads often warrant immediate attention"
    });
  }

  const normalizedScore = Math.max(0, Math.min(scoringConfig.maxScore, score));
  const confidence = Math.max(
    35,
    Math.min(
      98,
      40 +
        input.sourceTypes.length * 10 +
        (input.filingDate ? 10 : 0) +
        (input.estimatedEquity ? 8 : 0) +
        (input.taxDelinquencyAmount ? 8 : 0) +
        (input.vacantIndicator ? 6 : 0)
    )
  );

  return {
    score: normalizedScore,
    confidence,
    factors
  };
}
