import { OccupancyType } from "@prisma/client";
import { CanonicalLeadRecord } from "@/types/domain";

export function finalizeNormalizedLead(record: CanonicalLeadRecord): CanonicalLeadRecord {
  return {
    ...record,
    status: record.status,
    occupancyType: record.occupancyType ?? OccupancyType.UNKNOWN,
    distressTags: Array.from(new Set(record.distressTags)),
    vacantIndicator: record.vacantIndicator ?? false
  };
}
