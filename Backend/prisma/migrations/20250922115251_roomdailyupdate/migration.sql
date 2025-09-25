/*
  Warnings:

  - You are about to drop the column `dailyRates` on the `RoomDailyRate` table. All the data in the column will be lost.
  - Added the required column `hotelId` to the `RoomDailyRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomType` to the `RoomDailyRate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoomDailyRate" DROP COLUMN "dailyRates",
ADD COLUMN     "hotelId" TEXT NOT NULL,
ADD COLUMN     "prices" DECIMAL(65,30)[],
ADD COLUMN     "roomType" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RoomDailyRate" ADD CONSTRAINT "RoomDailyRate_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
