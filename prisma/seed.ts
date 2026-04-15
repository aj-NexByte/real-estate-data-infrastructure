import { LeadStatus, OccupancyType, PrismaClient, SourceType } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { scoreLead } from "@/lib/scoring/score-lead";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = hashSync("demo1234", 10);

  await prisma.user.upsert({
    where: { email: "operator@example.com" },
    update: {
      name: "Demo Operator",
      passwordHash: adminPasswordHash
    },
    create: {
      email: "operator@example.com",
      name: "Demo Operator",
      passwordHash: adminPasswordHash
    }
  });

  const sources = [
    {
      sourceKey: "cook-county-tax-liens",
      displayName: "Cook County Tax Liens",
      county: "Cook",
      state: "IL",
      sourceType: SourceType.TAX_LIEN,
      adapterKey: "csv-tax-lien",
      sourceUrl: "https://example.gov/cook/tax-liens.csv",
      allowsScraping: false,
      requiresBrowser: false,
      rateLimitPerMinute: 12,
      scheduleCron: "0 */6 * * *"
    },
    {
      sourceKey: "duval-code-violations",
      displayName: "Duval County Code Violations",
      county: "Duval",
      state: "FL",
      sourceType: SourceType.CODE_VIOLATION,
      adapterKey: "html-code-violation",
      sourceUrl: "https://example.gov/duval/code-violations",
      allowsScraping: true,
      requiresBrowser: false,
      rateLimitPerMinute: 8,
      scheduleCron: "0 */12 * * *"
    },
    {
      sourceKey: "manual-upload-distress",
      displayName: "Manual Upload Distress Batch",
      county: "Maricopa",
      state: "AZ",
      sourceType: SourceType.MANUAL_IMPORT,
      adapterKey: "manual-upload",
      sourceUrl: null,
      allowsScraping: false,
      requiresBrowser: false,
      rateLimitPerMinute: 60,
      scheduleCron: null
    }
  ];

  for (const source of sources) {
    await prisma.countySourceConfig.upsert({
      where: { sourceKey: source.sourceKey },
      update: source,
      create: source
    });
  }

  const sampleLeads = [
    {
      propertyAddress: "1452 W Fulton St",
      propertyAddressNorm: "1452 W FULTON ST",
      city: "Chicago",
      state: "IL",
      zipCode: "60607",
      county: "Cook",
      parcelNumber: "17-08-214-031-0000",
      parcelNumberNorm: "17082140310000",
      ownerName: "Maple Crest Holdings LLC",
      ownerNameNorm: "MAPLE CREST HOLDINGS LLC",
      mailingAddress: "PO Box 554, Naperville, IL 60566",
      primarySourceType: SourceType.TAX_LIEN,
      sourceTypes: [SourceType.TAX_LIEN, SourceType.VACANT_PROPERTY],
      sourceUrl: "https://example.gov/cook/tax-liens.csv",
      filingDate: new Date("2026-03-20"),
      noticeDate: new Date("2026-03-18"),
      assessedValue: 420000,
      estimatedMarketValue: 760000,
      estimatedEquity: 265000,
      ownershipLengthMonths: 124,
      taxDelinquencyAmount: 14680,
      occupancyType: OccupancyType.ABSENTEE,
      vacantIndicator: true,
      distressTags: ["tax_lien", "vacant", "absentee_owner", "equity_rich"],
      status: LeadStatus.NEW,
      notes: "Multiple unpaid installments; city inspection noted boarded entry.",
      aiSummary: "Absentee owner with strong equity and vacancy signals. Recent tax delinquency suggests fast follow-up.",
      aiPriorityReason: "Tax lien plus vacancy creates a high-probability distress window.",
      rawReference: "cook-county-tax-liens:row-1001"
    },
    {
      propertyAddress: "9824 Cedar Bluff Ln",
      propertyAddressNorm: "9824 CEDAR BLUFF LN",
      city: "Jacksonville",
      state: "FL",
      zipCode: "32221",
      county: "Duval",
      parcelNumber: "001234-0000",
      parcelNumberNorm: "0012340000",
      ownerName: "Erica Thompson",
      ownerNameNorm: "ERICA THOMPSON",
      mailingAddress: "9824 Cedar Bluff Ln, Jacksonville, FL 32221",
      primarySourceType: SourceType.CODE_VIOLATION,
      sourceTypes: [SourceType.CODE_VIOLATION, SourceType.PROBATE],
      sourceUrl: "https://example.gov/duval/code-violations",
      filingDate: new Date("2026-04-02"),
      noticeDate: new Date("2026-04-01"),
      assessedValue: 198000,
      estimatedMarketValue: 310000,
      estimatedEquity: 192000,
      ownershipLengthMonths: 201,
      occupancyType: OccupancyType.UNKNOWN,
      vacantIndicator: false,
      distressTags: ["code_violation", "probate", "equity_rich"],
      status: LeadStatus.REVIEWED,
      notes: "Open probate case in county court; nuisance violation for tall grass and unsecured structure.",
      aiSummary: "Probate overlap and long-term ownership make this a meaningful outreach candidate.",
      aiPriorityReason: "High equity with administrative distress signals.",
      rawReference: "duval-code-violations:item-445"
    },
    {
      propertyAddress: "4118 N 73rd Dr",
      propertyAddressNorm: "4118 N 73RD DR",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85033",
      county: "Maricopa",
      parcelNumber: "102-55-888",
      parcelNumberNorm: "10255888",
      ownerName: "Saguaro Peak Investments",
      ownerNameNorm: "SAGUARO PEAK INVESTMENTS",
      mailingAddress: "7201 W Sunnyslope Dr, Peoria, AZ 85345",
      primarySourceType: SourceType.MANUAL_IMPORT,
      sourceTypes: [SourceType.MANUAL_IMPORT, SourceType.DELINQUENT_TAX],
      sourceUrl: null,
      filingDate: new Date("2026-03-11"),
      noticeDate: new Date("2026-03-10"),
      assessedValue: 240000,
      estimatedMarketValue: 365000,
      estimatedEquity: 78000,
      ownershipLengthMonths: 74,
      taxDelinquencyAmount: 8300,
      occupancyType: OccupancyType.ABSENTEE,
      vacantIndicator: false,
      distressTags: ["manual_import", "delinquent_tax", "absentee_owner"],
      status: LeadStatus.CONTACTED,
      notes: "Imported from local list broker. Needs skip trace verification.",
      aiSummary: "Moderate equity absentee-owner tax distress lead.",
      aiPriorityReason: "Good campaign fit for tax-delinquency outreach.",
      rawReference: "manual-upload-distress:batch-demo-1"
    }
  ];

  for (const seed of sampleLeads) {
    const scoring = scoreLead({
      sourceTypes: seed.sourceTypes,
      distressTags: seed.distressTags as never,
      filingDate: seed.filingDate,
      estimatedEquity: Number(seed.estimatedEquity),
      occupancyType: seed.occupancyType,
      vacantIndicator: seed.vacantIndicator,
      ownershipLengthMonths: seed.ownershipLengthMonths,
      taxDelinquencyAmount: seed.taxDelinquencyAmount ? Number(seed.taxDelinquencyAmount) : null
    });

    const lead = await prisma.lead.upsert({
      where: { id: seed.rawReference! },
      update: {
        ...seed,
        leadScore: scoring.score,
        confidenceScore: scoring.confidence,
        rawPayload: { seeded: true }
      },
      create: {
        id: seed.rawReference!,
        ...seed,
        leadScore: scoring.score,
        confidenceScore: scoring.confidence,
        rawPayload: { seeded: true }
      }
    });

    await prisma.leadSourceRecord.upsert({
      where: {
        sourceType_normalizedHash: {
          sourceType: seed.primarySourceType,
          normalizedHash: `${seed.propertyAddressNorm}:${seed.parcelNumberNorm ?? "none"}`
        }
      },
      update: {
        sourceUrl: seed.sourceUrl,
        filingDate: seed.filingDate,
        noticeDate: seed.noticeDate,
        distressTags: seed.distressTags,
        rawPayload: { seeded: true, rawReference: seed.rawReference }
      },
      create: {
        leadId: lead.id,
        sourceType: seed.primarySourceType,
        sourceUrl: seed.sourceUrl,
        filingDate: seed.filingDate,
        noticeDate: seed.noticeDate,
        distressTags: seed.distressTags,
        normalizedHash: `${seed.propertyAddressNorm}:${seed.parcelNumberNorm ?? "none"}`,
        rawPayload: { seeded: true, rawReference: seed.rawReference }
      }
    });
  }

  const seededLead = await prisma.lead.findFirst({
    where: { propertyAddressNorm: "1452 W FULTON ST" }
  });

  if (seededLead) {
    await prisma.leadNote.deleteMany({
      where: {
        leadId: seededLead.id
      }
    });

    await prisma.contactEvent.deleteMany({
      where: {
        leadId: seededLead.id
      }
    });

    await prisma.leadTask.deleteMany({
      where: {
        leadId: seededLead.id
      }
    });

    await prisma.leadNote.createMany({
      data: [
        {
          leadId: seededLead.id,
          body: "Initial review completed. Strong vacancy signal and large delinquency."
        },
        {
          leadId: seededLead.id,
          body: "Need skip trace before direct outreach sequence."
        }
      ]
    });

    await prisma.contactEvent.createMany({
      data: [
        {
          leadId: seededLead.id,
          channel: "mail",
          summary: "Queued handwritten mailer for absentee owner address."
        }
      ]
    });

    await prisma.leadTask.createMany({
      data: [
        {
          leadId: seededLead.id,
          title: "Verify vacancy with street-view/manual review",
          dueAt: new Date("2026-04-18")
        },
        {
          leadId: seededLead.id,
          title: "Send follow-up call task to acquisitions rep",
          dueAt: new Date("2026-04-21")
        }
      ]
    });
  }

  await prisma.savedFilter.upsert({
    where: { id: "high-score-cook" },
    update: {
      name: "Cook County High Score",
      query: {
        county: "Cook",
        minScore: 70
      }
    },
    create: {
      id: "high-score-cook",
      name: "Cook County High Score",
      query: {
        county: "Cook",
        minScore: 70
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
