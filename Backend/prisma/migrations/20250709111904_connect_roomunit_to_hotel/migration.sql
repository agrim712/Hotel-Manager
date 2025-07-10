/*
  Warnings:

  - You are about to drop the column `notes` on the `RoomUnit` table. All the data in the column will be lost.
  - Added the required column `hotelId` to the `RoomUnit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoomUnit" DROP COLUMN "notes",
ADD COLUMN     "hotelId" TEXT NOT NULL,
ALTER COLUMN "floor" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "RoomUnit" ADD CONSTRAINT "RoomUnit_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
