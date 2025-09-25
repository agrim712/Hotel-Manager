/*
  Warnings:

  - You are about to drop the column `statusArray` on the `RoomUnit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."RoomUnit" DROP COLUMN "statusArray",
ADD COLUMN     "dailyStatus" TEXT[] DEFAULT ARRAY[]::TEXT[];
