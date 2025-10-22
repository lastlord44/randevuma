/*
  Warnings:

  - You are about to drop the column `customerPhone` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Staff` table. All the data in the column will be lost.
  - Added the required column `customerTel` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationMin` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "StaffSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffSkill_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StaffSkill_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StaffTimeOff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffTimeOff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerTel" TEXT NOT NULL,
    "customerEmail" TEXT,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'booked',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "businessId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    CONSTRAINT "Appointment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("businessId", "createdAt", "customerEmail", "customerName", "endAt", "id", "serviceId", "staffId", "startAt", "status", "updatedAt") SELECT "businessId", "createdAt", "customerEmail", "customerName", "endAt", "id", "serviceId", "staffId", "startAt", "status", "updatedAt" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
CREATE INDEX "Appointment_businessId_idx" ON "Appointment"("businessId");
CREATE INDEX "Appointment_serviceId_idx" ON "Appointment"("serviceId");
CREATE INDEX "Appointment_staffId_idx" ON "Appointment"("staffId");
CREATE INDEX "Appointment_startAt_idx" ON "Appointment"("startAt");
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMin" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "bufferBefore" INTEGER NOT NULL DEFAULT 0,
    "bufferAfter" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "businessId" TEXT NOT NULL,
    CONSTRAINT "Service_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Service" ("bufferAfter", "bufferBefore", "businessId", "createdAt", "description", "id", "name", "price", "updatedAt") SELECT "bufferAfter", "bufferBefore", "businessId", "createdAt", "description", "id", "name", "price", "updatedAt" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE INDEX "Service_businessId_idx" ON "Service"("businessId");
CREATE TABLE "new_Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "title" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "businessId" TEXT NOT NULL,
    CONSTRAINT "Staff_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Staff" ("businessId", "createdAt", "email", "id", "name", "phone", "title", "updatedAt") SELECT "businessId", "createdAt", "email", "id", "name", "phone", "title", "updatedAt" FROM "Staff";
DROP TABLE "Staff";
ALTER TABLE "new_Staff" RENAME TO "Staff";
CREATE INDEX "Staff_businessId_idx" ON "Staff"("businessId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "StaffSkill_staffId_idx" ON "StaffSkill"("staffId");

-- CreateIndex
CREATE INDEX "StaffSkill_serviceId_idx" ON "StaffSkill"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffSkill_staffId_serviceId_key" ON "StaffSkill"("staffId", "serviceId");

-- CreateIndex
CREATE INDEX "StaffTimeOff_staffId_idx" ON "StaffTimeOff"("staffId");

-- CreateIndex
CREATE INDEX "StaffTimeOff_startAt_endAt_idx" ON "StaffTimeOff"("startAt", "endAt");
