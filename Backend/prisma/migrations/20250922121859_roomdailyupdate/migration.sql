/*
  Warnings:

  - A unique constraint covering the columns `[roomId,rateType,yearStart]` on the table `RoomDailyRate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RoomDailyRate_roomId_rateType_yearStart_key" ON "RoomDailyRate"("roomId", "rateType", "yearStart");
