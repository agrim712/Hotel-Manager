/*
  Warnings:

  - You are about to drop the column `basePrice` on the `RoomDailyRate` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `RoomDailyRate` table. All the data in the column will be lost.
  - You are about to drop the column `maxPrice` on the `RoomDailyRate` table. All the data in the column will be lost.
  - You are about to drop the column `minPrice` on the `RoomDailyRate` table. All the data in the column will be lost.
  - You are about to drop the column `ratePlanId` on the `RoomDailyRate` table. All the data in the column will be lost.
  - You are about to drop the column `roomNumber` on the `RoomDailyRate` table. All the data in the column will be lost.
  - You are about to drop the `RatePlan` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[roomId,rateType,yearStart]` on the table `RoomDailyRate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rateType` to the `RoomDailyRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `RoomDailyRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearStart` to the `RoomDailyRate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RatePlan" DROP CONSTRAINT "RatePlan_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "RatePlan" DROP CONSTRAINT "RatePlan_roomTypeId_fkey";

-- DropForeignKey
ALTER TABLE "RoomDailyRate" DROP CONSTRAINT "RoomDailyRate_ratePlanId_fkey";

-- DropIndex
DROP INDEX "RoomDailyRate_date_roomNumber_ratePlanId_key";

-- AlterTable
ALTER TABLE "RoomDailyRate" DROP COLUMN "basePrice",
DROP COLUMN "date",
DROP COLUMN "maxPrice",
DROP COLUMN "minPrice",
DROP COLUMN "ratePlanId",
DROP COLUMN "roomNumber",
ADD COLUMN     "dailyRates" DECIMAL(65,30)[],
ADD COLUMN     "rateType" TEXT NOT NULL,
ADD COLUMN     "roomId" TEXT NOT NULL,
ADD COLUMN     "yearStart" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "RatePlan";

-- CreateIndex
CREATE UNIQUE INDEX "RoomDailyRate_roomId_rateType_yearStart_key" ON "RoomDailyRate"("roomId", "rateType", "yearStart");

-- AddForeignKey
ALTER TABLE "RoomDailyRate" ADD CONSTRAINT "RoomDailyRate_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
