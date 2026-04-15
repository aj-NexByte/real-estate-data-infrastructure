export const scoringConfig = {
  maxScore: 100,
  distressSignalWeight: 12,
  recency: {
    within30Days: 18,
    within90Days: 12,
    older: 5
  },
  absenteeOwner: 12,
  vacantIndicator: 14,
  equity: {
    high: 16,
    medium: 10,
    low: 4
  },
  longOwnership: 9,
  severeTaxDelinquency: 12,
  overlapBonus: {
    probateAndDelinquency: 16,
    foreclosureAndVacant: 14
  }
} as const;
