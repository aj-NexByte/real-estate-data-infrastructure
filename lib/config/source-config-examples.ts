export const exampleCountyAdapterConfigs = [
  {
    county: "Cook",
    state: "IL",
    sourceType: "TAX_LIEN",
    adapterKey: "csv-tax-lien",
    ingestionMode: "download",
    scheduleCron: "0 */6 * * *",
    notes: "CSV download source with regular delinquent tax updates."
  },
  {
    county: "Duval",
    state: "FL",
    sourceType: "CODE_VIOLATION",
    adapterKey: "html-code-violation",
    ingestionMode: "scraper",
    scheduleCron: "0 */12 * * *",
    notes: "HTML table source. Requires robots/terms review before production use."
  },
  {
    county: "Maricopa",
    state: "AZ",
    sourceType: "MANUAL_IMPORT",
    adapterKey: "manual-upload",
    ingestionMode: "manual",
    scheduleCron: null,
    notes: "Used for broker files, county spreadsheets, and ad-hoc clerk exports."
  }
];
