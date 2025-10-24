-- CreateTable: AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "meta" TEXT
);

-- CreateTable: FeatureFlag
CREATE TABLE "FeatureFlag" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "enabled" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- AlterTable: Add deletedAt to Staff
ALTER TABLE "Staff" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable: Add deletedAt to Service
ALTER TABLE "Service" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable: Add deletedAt to Appointment
ALTER TABLE "Appointment" ADD COLUMN "deletedAt" DATETIME;

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_at_idx" ON "AuditLog"("at");

-- CreateIndex
CREATE INDEX "Service_businessId_deletedAt_idx" ON "Service"("businessId", "deletedAt");

-- DropIndex (old unique constraint for Staff)
DROP INDEX IF EXISTS "Staff_businessId_slug_key";

-- CreateIndex (new unique constraint with deletedAt)
CREATE UNIQUE INDEX "Staff_businessId_slug_deletedAt_key" ON "Staff"("businessId", "slug", "deletedAt");

