/*
  Warnings:

  - Made the column `rateType` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "rateType" SET NOT NULL,
ALTER COLUMN "rateType" SET DATA TYPE TEXT;
