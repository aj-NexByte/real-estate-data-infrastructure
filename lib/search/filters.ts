import { LeadStatus, OccupancyType, SourceType } from "@prisma/client";

export const leadStatusOptions = ["ALL", ...Object.values(LeadStatus)] as const;
export const occupancyOptions = ["ALL", ...Object.values(OccupancyType)] as const;
export const sourceTypeOptions = Object.values(SourceType);
