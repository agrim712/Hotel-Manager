/*
  Warnings:

  - You are about to drop the column `status` on the `RoomUnit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roomId,roomNumber]` on the table `RoomUnit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `RoomUnit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."RoomUnit" DROP COLUMN "status",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "statusArray" "public"."RoomStatus"[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RoomUnit_roomId_roomNumber_key" ON "public"."RoomUnit"("roomId", "roomNumber");
