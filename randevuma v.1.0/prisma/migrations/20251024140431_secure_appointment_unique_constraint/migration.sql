/*
  Warnings:

  - A unique constraint covering the columns `[staffId,startAt]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Appointment_businessId_staffId_startAt_idx" ON "Appointment"("businessId", "staffId", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_staffId_startAt_key" ON "Appointment"("staffId", "startAt");
