import { Prisma } from "@prisma/client";
import { getAdapter } from "@/lib/adapters/registry";
import { prisma } from "@/lib/db/prisma";
import { buildLeadUpsertData, findExistingLead } from "@/lib/ingestion/dedupe";
import { finalizeNormalizedLead } from "@/lib/ingestion/normalize";
import { scoreLead } from "@/lib/scoring/score-lead";
import { normalizeAddress, normalizeParcel } from "@/lib/utils/normalization";
import { AdapterContext, CanonicalLeadRecord } from "@/types/domain";

interface IngestSourceInput {
  sourceKey: string;
  csvBodyOverride?: string;
}

export async function ingestSource(input: IngestSourceInput) {
  const source = await prisma.countySourceConfig.findUnique({
    where: { sourceKey: input.sourceKey }
  });

  if (!source) {
    throw new Error(`Unknown source key "${input.sourceKey}"`);
  }

  const run = await prisma.ingestionRun.create({
    data: {
      countySourceConfigId: source.id,
      sourceKey: source.sourceKey,
      adapterKey: source.adapterKey,
      status: "RUNNING"
    }
  });

  const context: AdapterContext = {
    runId: run.id,
    sourceKey: source.sourceKey,
    sourceName: source.displayName,
    county: source.county,
    state: source.state,
    rateLimitPerMinute: source.rateLimitPerMinute
  };

  try {
    const adapter = getAdapter(source.adapterKey);
    const fetched = input.csvBodyOverride
      ? {
          contentType: "manual" as const,
          body: input.csvBodyOverride,
          sourceUrl: source.sourceUrl ?? undefined
        }
      : await adapter.fetchRaw(context);

    const parsed = await adapter.parseRaw(fetched, context);
    let leadsCreated = 0;
    let leadsUpdated = 0;

    for (const parsedRecord of parsed) {
      const normalized = await adapter.normalize(parsedRecord, context);
      if (!normalized) {
        continue;
      }

      const finalized = finalizeNormalizedLead(normalized);
      const result = await upsertLeadFromNormalizedRecord(finalized, source.id, parsedRecord.sourceRecordId);

      if (result.wasUpdate) {
        leadsUpdated += 1;
      } else {
        leadsCreated += 1;
      }
    }

    const completed = await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        recordsFetched: parsed.length,
        recordsNormalized: parsed.length,
        leadsCreated,
        leadsUpdated
      }
    });

    return completed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ingestion error";

    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorsCount: 1,
        message,
        errorLog: {
          message
        }
      }
    });

    throw error;
  }
}

export async function upsertLeadFromNormalizedRecord(
  record: CanonicalLeadRecord,
  countySourceConfigId?: string | null,
  sourceRecordId?: string
) {
  // The canonical lead is the durable entity; source records remain append-only history
  // so multiple distress indicators can accumulate without duplicating the lead itself.
  const dedupe = await findExistingLead(record);
  const leadData = buildLeadUpsertData(record);
  const existingState = dedupe.leadId
    ? await prisma.lead.findUnique({
        where: { id: dedupe.leadId },
        select: { sourceTypes: true, distressTags: true }
      })
    : null;
  const mergedSourceTypes = Array.from(new Set([...(existingState?.sourceTypes ?? []), record.sourceType]));
  const mergedDistressTags = Array.from(new Set([...(existingState?.distressTags ?? []), ...record.distressTags]));
  const scoring = scoreLead({
    sourceTypes: mergedSourceTypes,
    distressTags: mergedDistressTags as typeof record.distressTags,
    filingDate: record.filingDate,
    estimatedEquity: record.estimatedEquity ?? null,
    occupancyType: record.occupancyType ?? null,
    vacantIndicator: record.vacantIndicator ?? null,
    ownershipLengthMonths: record.ownershipLengthMonths ?? null,
    taxDelinquencyAmount: record.taxDelinquencyAmount ?? null
  });

  const lead = dedupe.leadId
    ? await prisma.lead.update({
        where: { id: dedupe.leadId },
        data: {
          ...mergeLeadUpdateData(leadData),
          sourceTypes: {
            set: mergedSourceTypes
          },
          distressTags: mergedDistressTags,
          leadScore: scoring.score,
          confidenceScore: scoring.confidence,
          lastSeenAt: new Date()
        }
      })
    : await prisma.lead.create({
        data: {
          ...leadData,
          leadScore: scoring.score,
          confidenceScore: scoring.confidence
        }
      });

  await prisma.leadSourceRecord.upsert({
    where: {
      sourceType_normalizedHash: {
        sourceType: record.sourceType,
        normalizedHash: buildSourceHash(record, sourceRecordId)
      }
    },
    update: {
      distressTags: Array.from(new Set(record.distressTags)),
      rawPayload: (record.rawPayload ?? {}) as Prisma.InputJsonValue
    },
    create: {
      leadId: lead.id,
      countySourceConfigId: countySourceConfigId ?? null,
      sourceType: record.sourceType,
      sourceRecordId: sourceRecordId ?? record.rawReference ?? null,
      sourceUrl: record.sourceUrl ?? null,
      filingDate: record.filingDate ?? null,
      noticeDate: record.noticeDate ?? null,
      status: record.status ?? "NEW",
      distressTags: Array.from(new Set(record.distressTags)),
      normalizedHash: buildSourceHash(record, sourceRecordId),
      rawPayload: (record.rawPayload ?? {}) as Prisma.InputJsonValue
    }
  });

  return {
    lead,
    wasUpdate: Boolean(dedupe.leadId)
  };
}

function buildSourceHash(record: CanonicalLeadRecord, sourceRecordId?: string) {
  return [
    normalizeParcel(record.parcelNumber) || "noparcel",
    normalizeAddress(record.propertyAddress) || "noaddress",
    sourceRecordId ?? record.rawReference ?? "noref"
  ].join(":");
}

function mergeLeadUpdateData(data: ReturnType<typeof buildLeadUpsertData>) {
  return {
    propertyAddress: data.propertyAddress,
    propertyAddressNorm: data.propertyAddressNorm,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    county: data.county,
    parcelNumber: data.parcelNumber,
    parcelNumberNorm: data.parcelNumberNorm,
    ownerName: data.ownerName,
    ownerNameNorm: data.ownerNameNorm,
    mailingAddress: data.mailingAddress,
    sourceUrl: data.sourceUrl,
    filingDate: data.filingDate,
    noticeDate: data.noticeDate,
    assessedValue: data.assessedValue,
    estimatedMarketValue: data.estimatedMarketValue,
    estimatedEquity: data.estimatedEquity,
    ownershipLengthMonths: data.ownershipLengthMonths,
    taxDelinquencyAmount: data.taxDelinquencyAmount,
    occupancyType: data.occupancyType,
    vacantIndicator: data.vacantIndicator,
    phone: data.phone,
    email: data.email,
    notes: data.notes,
    rawReference: data.rawReference,
    rawPayload: data.rawPayload,
    primarySourceType: data.primarySourceType
  };
}
