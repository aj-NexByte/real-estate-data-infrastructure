-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('TAX_LIEN', 'FORECLOSURE', 'PROBATE', 'CODE_VIOLATION', 'EVICTION', 'DELINQUENT_TAX', 'SHERIFF_SALE', 'VACANT_PROPERTY', 'DEED_TRANSFER', 'LIS_PENDENS', 'UTILITY_SHUTOFF', 'MANUAL_IMPORT');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'REVIEWED', 'CONTACTED', 'FOLLOW_UP', 'DEAD');

-- CreateEnum
CREATE TYPE "OccupancyType" AS ENUM ('OWNER_OCCUPIED', 'ABSENTEE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'DONE');

-- CreateEnum
CREATE TYPE "IngestionRunStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountySourceConfig" (
    "id" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "adapterKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "requiresBrowser" BOOLEAN NOT NULL DEFAULT false,
    "allowsScraping" BOOLEAN NOT NULL DEFAULT false,
    "robotsReviewStatus" TEXT NOT NULL DEFAULT 'pending_review',
    "termsReviewStatus" TEXT NOT NULL DEFAULT 'pending_review',
    "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 12,
    "scheduleCron" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountySourceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "propertyAddress" TEXT NOT NULL,
    "propertyAddressNorm" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "parcelNumber" TEXT,
    "parcelNumberNorm" TEXT,
    "ownerName" TEXT,
    "ownerNameNorm" TEXT,
    "mailingAddress" TEXT,
    "county" TEXT NOT NULL,
    "sourceTypes" "SourceType"[],
    "primarySourceType" "SourceType" NOT NULL,
    "sourceUrl" TEXT,
    "filingDate" TIMESTAMP(3),
    "noticeDate" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "assessedValue" DECIMAL(14,2),
    "estimatedMarketValue" DECIMAL(14,2),
    "estimatedEquity" DECIMAL(14,2),
    "ownershipLengthMonths" INTEGER,
    "taxDelinquencyAmount" DECIMAL(14,2),
    "occupancyType" "OccupancyType" NOT NULL DEFAULT 'UNKNOWN',
    "vacantIndicator" BOOLEAN NOT NULL DEFAULT false,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "distressTags" TEXT[],
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "aiSummary" TEXT,
    "aiPriorityReason" TEXT,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "confidenceScore" INTEGER NOT NULL DEFAULT 0,
    "rawReference" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadSourceRecord" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "countySourceConfigId" TEXT,
    "sourceType" "SourceType" NOT NULL,
    "sourceRecordId" TEXT,
    "sourceUrl" TEXT,
    "filingDate" TIMESTAMP(3),
    "noticeDate" TIMESTAMP(3),
    "status" TEXT,
    "distressTags" TEXT[],
    "normalizedHash" TEXT NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadSourceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadTask" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "ownerId" TEXT,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactEvent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "userId" TEXT,
    "channel" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionRun" (
    "id" TEXT NOT NULL,
    "countySourceConfigId" TEXT,
    "sourceKey" TEXT NOT NULL,
    "adapterKey" TEXT NOT NULL,
    "status" "IngestionRunStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "recordsFetched" INTEGER NOT NULL DEFAULT 0,
    "recordsNormalized" INTEGER NOT NULL DEFAULT 0,
    "leadsCreated" INTEGER NOT NULL DEFAULT 0,
    "leadsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errorsCount" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "errorLog" JSONB,
    "metadata" JSONB,

    CONSTRAINT "IngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedFilter" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "query" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedFilter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CountySourceConfig_sourceKey_key" ON "CountySourceConfig"("sourceKey");

-- CreateIndex
CREATE INDEX "Lead_county_state_status_idx" ON "Lead"("county", "state", "status");

-- CreateIndex
CREATE INDEX "Lead_propertyAddressNorm_idx" ON "Lead"("propertyAddressNorm");

-- CreateIndex
CREATE INDEX "Lead_parcelNumberNorm_idx" ON "Lead"("parcelNumberNorm");

-- CreateIndex
CREATE INDEX "Lead_ownerNameNorm_idx" ON "Lead"("ownerNameNorm");

-- CreateIndex
CREATE INDEX "LeadSourceRecord_leadId_idx" ON "LeadSourceRecord"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadSourceRecord_sourceType_normalizedHash_key" ON "LeadSourceRecord"("sourceType", "normalizedHash");

-- CreateIndex
CREATE INDEX "IngestionRun_sourceKey_startedAt_idx" ON "IngestionRun"("sourceKey", "startedAt");

-- AddForeignKey
ALTER TABLE "LeadSourceRecord" ADD CONSTRAINT "LeadSourceRecord_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSourceRecord" ADD CONSTRAINT "LeadSourceRecord_countySourceConfigId_fkey" FOREIGN KEY ("countySourceConfigId") REFERENCES "CountySourceConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTask" ADD CONSTRAINT "LeadTask_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTask" ADD CONSTRAINT "LeadTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactEvent" ADD CONSTRAINT "ContactEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactEvent" ADD CONSTRAINT "ContactEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionRun" ADD CONSTRAINT "IngestionRun_countySourceConfigId_fkey" FOREIGN KEY ("countySourceConfigId") REFERENCES "CountySourceConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedFilter" ADD CONSTRAINT "SavedFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

