import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { normalizeAddress, normalizeOwnerName, normalizeParcel } from "@/lib/utils/normalization";
import { CanonicalLeadRecord, DeduplicationResult } from "@/types/domain";

export async function findExistingLead(record: CanonicalLeadRecord): Promise<DeduplicationResult> {
  const parcel = normalizeParcel(record.parcelNumber);
  const address = normalizeAddress(record.propertyAddress);
  const owner = normalizeOwnerName(record.ownerName);

  if (parcel) {
    const match = await prisma.lead.findFirst({
      where: { parcelNumberNorm: parcel },
      select: { id: true }
    });

    if (match) {
      return { leadId: match.id, matchedBy: "parcel" };
    }
  }

  if (address && owner) {
    const match = await prisma.lead.findFirst({
      where: {
        propertyAddressNorm: address,
        ownerNameNorm: owner
      },
      select: { id: true }
    });

    if (match) {
      return { leadId: match.id, matchedBy: "address_owner" };
    }
  }

  if (address) {
    const match = await prisma.lead.findFirst({
      where: { propertyAddressNorm: address },
      select: { id: true }
    });

    if (match) {
      return { leadId: match.id, matchedBy: "address" };
    }
  }

  return { matchedBy: "none" };
}

export function buildLeadUpsertData(record: CanonicalLeadRecord): Prisma.LeadUncheckedCreateInput {
  return {
    propertyAddress: record.propertyAddress,
    propertyAddressNorm: normalizeAddress(record.propertyAddress),
    city: record.city ?? null,
    state: record.state,
    zipCode: record.zipCode ?? null,
    county: record.county,
    parcelNumber: record.parcelNumber ?? null,
    parcelNumberNorm: normalizeParcel(record.parcelNumber),
    ownerName: record.ownerName ?? null,
    ownerNameNorm: normalizeOwnerName(record.ownerName),
    mailingAddress: record.mailingAddress ?? null,
    primarySourceType: record.sourceType,
    sourceTypes: [record.sourceType],
    sourceUrl: record.sourceUrl ?? null,
    filingDate: record.filingDate ?? null,
    noticeDate: record.noticeDate ?? null,
    lastSeenAt: new Date(),
    assessedValue: record.assessedValue ?? null,
    estimatedMarketValue: record.estimatedMarketValue ?? null,
    estimatedEquity: record.estimatedEquity ?? null,
    ownershipLengthMonths: record.ownershipLengthMonths ?? null,
    taxDelinquencyAmount: record.taxDelinquencyAmount ?? null,
    occupancyType: record.occupancyType ?? undefined,
    vacantIndicator: record.vacantIndicator ?? false,
    status: record.status,
    distressTags: record.distressTags,
    phone: record.phone ?? null,
    email: record.email ?? null,
    notes: record.notes ?? null,
    rawReference: record.rawReference ?? null,
    rawPayload: (record.rawPayload ?? Prisma.JsonNull) as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput,
    confidenceScore: record.confidenceScore ?? 55
  };
}
