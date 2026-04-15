import { LeadStatus, OccupancyType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export interface LeadFilters {
  county?: string;
  sourceType?: string;
  minScore?: number;
  maxScore?: number;
  startDate?: string;
  endDate?: string;
  occupancy?: OccupancyType | "ALL";
  status?: LeadStatus | "ALL";
  tag?: string;
  query?: string;
}

export async function getDashboardSnapshot(filters: LeadFilters = {}) {
  const where = buildLeadWhere(filters);

  const [leads, totalLeads, newLeads, avgScore, recentRuns, sourceHealth, savedFilters] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: [{ leadScore: "desc" }, { updatedAt: "desc" }],
      take: 50,
      include: {
        sources: true,
        notesTimeline: {
          orderBy: { createdAt: "desc" },
          take: 2
        }
      }
    }),
    prisma.lead.count({ where }),
    prisma.lead.count({
      where: {
        ...where,
        status: LeadStatus.NEW
      }
    }),
    prisma.lead.aggregate({
      where,
      _avg: {
        leadScore: true
      }
    }),
    prisma.ingestionRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
      include: {
        countySourceConfig: true
      }
    }),
    prisma.countySourceConfig.findMany({
      orderBy: [{ county: "asc" }, { displayName: "asc" }]
    }),
    prisma.savedFilter.findMany({
      orderBy: { updatedAt: "desc" }
    })
  ]);

  return {
    leads,
    metrics: {
      totalLeads,
      newLeads,
      averageScore: Math.round(avgScore._avg.leadScore ?? 0),
      highPriority: leads.filter((lead) => lead.leadScore >= 70).length
    },
    recentRuns,
    sourceHealth,
    savedFilters
  };
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      sources: {
        orderBy: { createdAt: "desc" },
        include: {
          countySourceConfig: true
        }
      },
      notesTimeline: {
        orderBy: { createdAt: "desc" }
      },
      contactHistory: {
        orderBy: { occurredAt: "desc" }
      },
      tasks: {
        orderBy: [{ status: "asc" }, { dueAt: "asc" }]
      }
    }
  });
}

export async function exportLeads(filters: LeadFilters = {}) {
  return prisma.lead.findMany({
    where: buildLeadWhere(filters),
    orderBy: [{ leadScore: "desc" }, { updatedAt: "desc" }]
  });
}

function buildLeadWhere(filters: LeadFilters): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};

  if (filters.county) {
    where.county = filters.county;
  }

  if (filters.sourceType) {
    where.sourceTypes = {
      has: filters.sourceType as never
    };
  }

  if (typeof filters.minScore === "number" || typeof filters.maxScore === "number") {
    where.leadScore = {
      gte: filters.minScore,
      lte: filters.maxScore
    };
  }

  if (filters.startDate || filters.endDate) {
    where.filingDate = {
      gte: filters.startDate ? new Date(filters.startDate) : undefined,
      lte: filters.endDate ? new Date(filters.endDate) : undefined
    };
  }

  if (filters.occupancy && filters.occupancy !== "ALL") {
    where.occupancyType = filters.occupancy;
  }

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.tag) {
    where.distressTags = {
      has: filters.tag
    };
  }

  if (filters.query) {
    where.OR = [
      {
        propertyAddress: {
          contains: filters.query,
          mode: "insensitive"
        }
      },
      {
        ownerName: {
          contains: filters.query,
          mode: "insensitive"
        }
      },
      {
        parcelNumber: {
          contains: filters.query,
          mode: "insensitive"
        }
      }
    ];
  }

  return where;
}
