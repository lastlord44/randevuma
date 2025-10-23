-- CreateTable
CREATE TABLE "Ban" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "reason" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT
);

-- CreateTable
CREATE TABLE "RiskLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ip" TEXT,
    "phone" TEXT,
    "deviceId" TEXT,
    "userAgent" TEXT,
    "path" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Ban_businessId_type_value_idx" ON "Ban"("businessId", "type", "value");

-- CreateIndex
CREATE INDEX "Ban_expiresAt_idx" ON "Ban"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Ban_businessId_type_value_key" ON "Ban"("businessId", "type", "value");

-- CreateIndex
CREATE INDEX "RiskLog_businessId_createdAt_idx" ON "RiskLog"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "RiskLog_phone_idx" ON "RiskLog"("phone");

-- CreateIndex
CREATE INDEX "RiskLog_ip_idx" ON "RiskLog"("ip");
